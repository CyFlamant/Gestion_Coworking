import { useEffect, useState } from "react";
import { getAvailableSpaces } from "../lib/api.js";

// Asks the API which spaces are free between start and end (local ISO strings), again each time they change.
// free: Set of the free space ids; null until the first answer, or when the search failed.
// searchError: the API's message when the search failed (e.g. the server cannot be reached), else null.
export function useFreeSpaces(start, end) {
  const [free, setFree] = useState(null);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    // An answer that arrives after a newer search started is ignored.
    let outdated = false;
    getAvailableSpaces({ start, end })
      .then((found) => {
        if (outdated) return;
        setFree(new Set(found.map((space) => space.id)));
        setSearchError(null);
      })
      .catch((err) => {
        if (outdated) return;
        setFree(null);
        setSearchError(err.detail ?? String(err));
      });
    return () => {
      outdated = true;
    };
  }, [start, end]);

  return { free, searchError };
}
