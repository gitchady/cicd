import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

const notes = [
  {
    id: 1,
    title: "Deploy backend",
    content: "Check /health",
    created_at: "2026-04-30T00:00:00Z",
    updated_at: "2026-04-30T00:00:00Z"
  }
];

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => notes
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders notes from the API", async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByText("Deploy backend")).toBeInTheDocument());
    expect(screen.getByText("Check /health")).toBeInTheDocument();
  });
});
