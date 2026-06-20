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

  it("renders blank image placeholders without image elements", () => {
    render(<OurTeam />);

    expect(screen.getAllByTestId("team-image-placeholder")).toHaveLength(4);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });

  it("handles mouse enter and leave events on cards correctly", () => {
    render(<OurTeam />);
    
    const firstMemberCard = screen.getByText("JHUN RUSSEL D. CLEMENTE").closest("div");
    
    // Validate that hovering doesn't crash the state
    fireEvent.mouseEnter(firstMemberCard);
    fireEvent.mouseLeave(firstMemberCard);
  });
});
