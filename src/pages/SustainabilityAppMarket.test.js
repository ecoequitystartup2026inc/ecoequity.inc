import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SustainabilityAppMarket from "./SustainabilityAppMarket";

describe("SustainabilityAppMarket Component", () => {
  it("renders the component heading and badge", () => {
    render(<SustainabilityAppMarket />);

    expect(screen.getByText("Market Sizing")).toBeInTheDocument();
    expect(screen.getByText(/Sustainability App Market Sizing/i)).toBeInTheDocument();
    expect(screen.getByText("TAM, SAM, SOM")).toBeInTheDocument();
    expect(
      screen.getByText(/A Philippines-focused view of the opportunity/i)
    ).toBeInTheDocument();
  });

  it("renders the market sizing tiers and their descriptions", () => {
    render(<SustainabilityAppMarket />);

    expect(screen.getByRole("heading", { name: "Total Available Market" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Serviceable Available Market" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Serviceable Obtainable Market" })).toBeInTheDocument();

    expect(screen.getByText("The Philippine Opportunity")).toBeInTheDocument();
    expect(screen.getByText("Reach in Major Urban Centers")).toBeInTheDocument();
    expect(screen.getByText("Our Initial Focus — Year 3 Goals")).toBeInTheDocument();

    expect(
      screen.getByText(/The entire market within the Philippines that could potentially use the product/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The portion of the TAM our services can realistically reach/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The realistic share we can capture in the first 3 years/)
    ).toBeInTheDocument();
  });

  it("renders the funnel overview and the per-tier line items", () => {
    render(<SustainabilityAppMarket />);

    // Each tier headline shows twice: once in the funnel bar, once in the card pill.
    expect(screen.getAllByText("₱10T+")).toHaveLength(2);
    expect(screen.getAllByText("₱5B")).toHaveLength(2);
    expect(screen.getAllByText("150K+")).toHaveLength(2);

    expect(screen.getByText("Philippine Consumer Spending")).toBeInTheDocument();
    expect(screen.getByText("₱10T+ PHP (~$170B USD)")).toBeInTheDocument();
    expect(screen.getByText("Core Engaged Users")).toBeInTheDocument();
    expect(screen.getByText("150K+ AMU")).toBeInTheDocument();
  });

  it("renders an image band on every tier card", () => {
    const { container } = render(<SustainabilityAppMarket />);

    const media = container.querySelectorAll(".sam-cardmedia img");
    expect(media).toHaveLength(3);

    expect([...media].map((img) => img.getAttribute("src"))).toEqual([
      "/farming.jpg",
      "/Solar.jpg",
      "/Planting.jpg",
    ]);

    media.forEach((img) => {
      expect(img.getAttribute("alt")).toBeTruthy();
      expect(img.getAttribute("loading")).toBe("lazy");
    });

    expect(screen.getByText("Nationwide food, wellness, and home-growing spend")).toBeInTheDocument();
    expect(screen.getByText("Metro households already spending on green living")).toBeInTheDocument();
    expect(screen.getByText("Early adopters turning harvests into income")).toBeInTheDocument();
  });

  it("renders a thumbnail on every line item across the three tiers", () => {
    const { container } = render(<SustainabilityAppMarket />);

    const thumbs = container.querySelectorAll(".sam-itemthumb img");
    expect(thumbs).toHaveLength(7); // 2 TAM + 2 SAM + 3 SOM

    expect([...thumbs].map((img) => img.getAttribute("src"))).toEqual([
      "/IMG_6223.jpeg",
      "/kit_balcony_herb.png",
      "/Establishment.jpg",
      "/herb_kit.png",
      "/kids_kit.png",
      "/starter_kit.png",
      "/Rice.jpg",
    ]);

    thumbs.forEach((img) => {
      expect(img.getAttribute("alt")).toBeTruthy();
      expect(img.getAttribute("loading")).toBe("lazy");
    });
  });

  it("applies the hover lift to a tier card on mouse enter and removes it on mouse leave", () => {
    const { container } = render(<SustainabilityAppMarket />);

    const cards = container.querySelectorAll(".sam-card");
    expect(cards).toHaveLength(3);

    cards.forEach((card) => {
      expect(card).not.toHaveStyle("transform: translateY(-5px)");

      fireEvent.mouseEnter(card);
      expect(card).toHaveStyle("transform: translateY(-5px)");
      expect(card.style.boxShadow).toBe(
        "inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 38px rgba(var(--eco-c11-rgb), 0.14)"
      );

      fireEvent.mouseLeave(card);
      expect(card).not.toHaveStyle("transform: translateY(-5px)");
    });
  });
});
