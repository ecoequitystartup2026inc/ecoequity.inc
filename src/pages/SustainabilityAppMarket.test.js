import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SustainabilityAppMarket from "./SustainabilityAppMarket";

describe("SustainabilityAppMarket Component", () => {
  it("renders the component heading and badge", () => {
    render(<SustainabilityAppMarket />);

    expect(screen.getByText("Who We Serve")).toBeInTheDocument();
    expect(screen.getByText(/Sustainability App Market Sizing/i)).toBeInTheDocument();
    expect(screen.getByText(/TAM, SAM, SOM \(Philippines Focus\)/i)).toBeInTheDocument();
  });

  it("renders the market sizing sections and their descriptions", () => {
    render(<SustainabilityAppMarket />);

    expect(screen.getByText("1. TAM (Total Available Market) - The Philippine Opportunity")).toBeInTheDocument();
    expect(screen.getByText("2. SAM (Serviceable Available Market) - Our Reach in Major Urban Centers")).toBeInTheDocument();
    expect(screen.getByText("3. SOM (Serviceable Obtainable Market) - Our Initial Focus (Year 3 Goals)")).toBeInTheDocument();

    expect(screen.getByText(/The entire market within the Philippines that could potentially use the product/)).toBeInTheDocument();
    expect(screen.getByText(/The portion of the TAM that our services can realistically reach/)).toBeInTheDocument();
    expect(screen.getByText(/The realistic market share we can capture in the first 3 years of operation/)).toBeInTheDocument();
  });

  it("renders the tables with correct headers and some data", () => {
    render(<SustainabilityAppMarket />);

    const tableHeaders = screen.getAllByRole("columnheader");
    expect(tableHeaders[0]).toHaveTextContent("Components");
    expect(tableHeaders[1]).toHaveTextContent("Description");
    expect(tableHeaders[2]).toHaveTextContent("Estimated Size (Conceptual)");

    expect(screen.getByText("Philippine Consumer Spending")).toBeInTheDocument();
    expect(screen.getByText("₱10+ Trillion PHP (Approx. $170 Billion USD)")).toBeInTheDocument();
    expect(screen.getByText("150,000+ Active Monthly Users (AMU)")).toBeInTheDocument();
  });

  it("applies hover effect to the table wrapper on mouse enter and removes it on mouse leave", () => {
    render(<SustainabilityAppMarket />);

    const tableWrappers = screen.getAllByRole("table").map(table => table.closest("div"));

    tableWrappers.forEach((tableWrapper, index) => {
      expect(tableWrapper).not.toHaveStyle("transform: translateY(-6px) scale(1.03)");
      expect(tableWrapper).not.toHaveStyle("background: rgba(255,255,255,0.18)");
      expect(tableWrapper).not.toHaveStyle("border: 1px solid rgba(255,255,255,0.30)");
      expect(tableWrapper).not.toHaveStyle("box-shadow: inset 0 1.5px 0 rgba(255,255,255,0.35), 0 20px 48px rgba(0,0,0,0.30), 0 0 0 0.5px rgba(255,255,255,0.14)");

      fireEvent.mouseEnter(tableWrapper);
      expect(tableWrapper).toHaveStyle("transform: translateY(-6px) scale(1.03)");
      expect(tableWrapper).toHaveStyle("background: rgba(255,255,255,0.18)");
      expect(tableWrapper).toHaveStyle("border: 1px solid rgba(255,255,255,0.30)");
      expect(tableWrapper).toHaveStyle("box-shadow: inset 0 1.5px 0 rgba(255,255,255,0.35), 0 20px 48px rgba(0,0,0,0.30), 0 0 0 0.5px rgba(255,255,255,0.14)");

      fireEvent.mouseLeave(tableWrapper);
      expect(tableWrapper).not.toHaveStyle("transform: translateY(-6px) scale(1.03)");
      expect(tableWrapper).not.toHaveStyle("background: rgba(255,255,255,0.18)");
      expect(tableWrapper).not.toHaveStyle("border: 1px solid rgba(255,255,255,0.30)");
      expect(tableWrapper).not.toHaveStyle("box-shadow: inset 0 1.5px 0 rgba(255,255,255,0.35), 0 20px 48px rgba(0,0,0,0.30), 0 0 0 0.5px rgba(255,255,255,0.14)");
    });
  });
});