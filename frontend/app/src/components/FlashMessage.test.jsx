import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { clearFlash, setFlash } from "../lib/flash.js";
import FlashMessage from "./FlashMessage.jsx";

beforeEach(() => clearFlash());

describe("FlashMessage", () => {
  it("shows the message saved before the page change", () => {
    setFlash("Réservation confirmée.");
    render(<FlashMessage />);
    expect(screen.getByRole("status")).toHaveTextContent("Réservation confirmée.");
  });

  it("shows it only once", () => {
    setFlash("Réservation confirmée.");
    const { unmount } = render(<FlashMessage />);
    unmount();
    render(<FlashMessage />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
