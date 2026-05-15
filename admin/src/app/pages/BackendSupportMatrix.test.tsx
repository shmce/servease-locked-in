// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BackendSupportMatrix } from "./BackendSupportMatrix";

describe("BackendSupportMatrix", () => {
  it("renders backend coverage and filters by endpoint text", async () => {
    const user = userEvent.setup();
    render(<BackendSupportMatrix />);

    expect(screen.getByRole("heading", { name: "Backend Support Matrix" })).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("Search screen, endpoint, or capability..."),
      "provider-applications",
    );

    expect(screen.getByText("Provider Applications")).toBeInTheDocument();
    expect(screen.queryByText("Transactions")).not.toBeInTheDocument();
  });
});
