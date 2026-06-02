import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SpecialistCertification from "./SpecialistCertification";

describe("SpecialistCertification Component", () => {
  it("opens the course details modal when 'View Course' is clicked", () => {
    render(<SpecialistCertification />);

    // Ensure the modal is closed initially
    expect(screen.queryByText("Course Details")).not.toBeInTheDocument();

    // Find all 'View Course' buttons and click the first one
    const viewButtons = screen.getAllByText("View Course");
    expect(viewButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(viewButtons[0]);

    // Verify the modal title and specific course details appear
    expect(screen.getByText("Course Details")).toBeInTheDocument();
    expect(screen.getByText(/Instructor: Dr\. Maria Santos/i)).toBeInTheDocument();
  });

  it("opens the enrollment modal when 'Enroll Now' is clicked", () => {
    render(<SpecialistCertification />);

    // Ensure the enroll modal is closed initially
    expect(screen.queryByText("Enroll in Certification")).not.toBeInTheDocument();

    // Find all 'Enroll Now' buttons and click the first one
    const enrollButtons = screen.getAllByText("Enroll Now");
    expect(enrollButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(enrollButtons[0]);

    // Verify the enrollment modal opens
    expect(screen.getByText("Enroll in Certification")).toBeInTheDocument();
  });

  it("submits the enrollment form and shows success modal", () => {
    jest.useFakeTimers();
    render(<SpecialistCertification />);

    // Open the modal
    const enrollButtons = screen.getAllByText("Enroll Now");
    fireEvent.click(enrollButtons[0]);

    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText("Juan Dela Cruz"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("juan@example.com"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("0912 345 6789"), { target: { value: "09123456789" } });
    fireEvent.change(screen.getByPlaceholderText("Cardholder Name"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("Card Number"), { target: { value: "1111222233334444" } });
    fireEvent.change(screen.getByPlaceholderText("MM/YY"), { target: { value: "12/25" } });
    fireEvent.change(screen.getByPlaceholderText("CVV"), { target: { value: "123" } });

    // Click submit
    const submitButton = screen.getByText(/Confirm Payment/i);
    fireEvent.click(submitButton);

    // Verify processing state
    expect(screen.getByText("Processing...")).toBeInTheDocument();

    // Fast-forward timers to trigger the success state
    act(() => {
      jest.runAllTimers();
    });

    // Verify success modal appears
    expect(screen.getByText("Enrollment Successful!")).toBeInTheDocument();

    jest.useRealTimers();
  });
});