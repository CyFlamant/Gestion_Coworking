import { useEffect, useState } from "react";
import { clearFlash, readFlash } from "../lib/flash.js";
import StatusMessage from "./StatusMessage.jsx";

// Shows the message saved by the previous page (lib/flash.js), once.
// Layout gives it a new key on every page change, so it reads the message again for each page.
export default function FlashMessage() {
  const [message] = useState(readFlash);

  // Forgotten once shown, so it doesn't come back on the following page. Only cleared if this
  // component read one: otherwise a late effect could erase a message just saved for the next page.
  useEffect(() => {
    if (message) clearFlash();
  }, [message]);

  if (!message) return null;
  return (
    <div className="inner flash">
      <StatusMessage>{message}</StatusMessage>
    </div>
  );
}
