import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import OurTeam from "./OurTeam";

describe("OurTeam Component", () => {
  it("renders the component heading and badge", () => {
    render(<OurTeam />);
    
    expect(screen.getByText("The People")).toBeDefined();
    expect(screen.getByText(/Our/)).toBeDefined();
    expect(screen.getByText(/Team/)).toBeDefined();
  });

  it("renders all team members with their roles", () => {
    render(<OurTeam />);
    
    expect(screen.getByText("JHUN RUSSEL D. CLEMENTE")).toBeDefined();

    const nameElements = screen.getAllByText("NAME");
    expect(nameElements).toHaveLength(3);

    const roleElements = screen.getAllByText("ROLE");
    expect(roleElements).toHaveLength(4);
  });

  it("renders team member images correctly", () => {
    render(<OurTeam />);
    
    const russelImg = screen.getByAltText("JHUN RUSSEL D. CLEMENTE");
    expect(russelImg).toHaveAttribute("src", "Russel.jpeg");

    const placeholderImgs = screen.getAllByAltText("NAME");
    expect(placeholderImgs).toHaveLength(3);
    expect(placeholderImgs[0]).toHaveAttribute("src", "Rus3.jpeg");
    expect(placeholderImgs[1]).toHaveAttribute("src", "Rus4.jpeg");
    expect(placeholderImgs[2]).toHaveAttribute("src", "Rus5.jpeg");
  });

  it("handles mouse enter and leave events on cards correctly", () => {
    render(<OurTeam />);
    
    const firstMemberCard = screen.getByText("JHUN RUSSEL D. CLEMENTE").closest("div");
    
    // Validate that hovering doesn't crash the state
    fireEvent.mouseEnter(firstMemberCard);
    fireEvent.mouseLeave(firstMemberCard);
  });
});