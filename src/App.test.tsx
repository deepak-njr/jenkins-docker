import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

it("renders", () => {
  render(<App />, { wrapper: BrowserRouter });
  expect(screen.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
});
