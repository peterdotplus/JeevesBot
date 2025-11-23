import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddAppointmentForm from "@/components/AddAppointmentForm";
import { Appointment } from "@/types/calendar";

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

describe("AddAppointmentForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form with all fields", () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    expect(screen.getByText("Add New Appointment")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Date (Multiple formats supported)"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Time (Multiple formats supported)"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Contact Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Appointment" }),
    ).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when close button is clicked", () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const closeButton = screen.getByRole("button", { name: "" });
    fireEvent.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("validates required fields", async () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const submitButton = screen.getByRole("button", {
      name: "Add Appointment",
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Date is required")).toBeInTheDocument();
      expect(screen.getByText("Time is required")).toBeInTheDocument();
      expect(screen.getByText("Contact name is required")).toBeInTheDocument();
      expect(screen.getByText("Category is required")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates date format", async () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const dateInput = screen.getByLabelText(
      "Date (Multiple formats supported)",
    );
    fireEvent.change(dateInput, { target: { value: "invalid-date" } });

    const submitButton = screen.getByRole("button", {
      name: "Add Appointment",
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid date format/)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates time format", async () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const timeInput = screen.getByLabelText(
      "Time (Multiple formats supported)",
    );
    fireEvent.change(timeInput, { target: { value: "invalid-time" } });

    const submitButton = screen.getByRole("button", {
      name: "Add Appointment",
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid time format/)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates invalid time values", async () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const timeInput = screen.getByLabelText(
      "Time (Multiple formats supported)",
    );
    fireEvent.change(timeInput, { target: { value: "25:00" } });

    const submitButton = screen.getByRole("button", {
      name: "Add Appointment",
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Hours must be 00-23/)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates invalid date values", async () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const dateInput = screen.getByLabelText(
      "Date (Multiple formats supported)",
    );
    fireEvent.change(dateInput, { target: { value: "32-13-2025" } });

    const submitButton = screen.getByRole("button", {
      name: "Add Appointment",
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Invalid date (does not exist in calendar)"),
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const appointmentData = {
      date: "21-11-2025",
      time: "14:30",
      contactName: "Peter van der Meer",
      category: "Ghostin 06",
    };

    fireEvent.change(
      screen.getByLabelText("Date (Multiple formats supported)"),
      {
        target: { value: appointmentData.date },
      },
    );
    fireEvent.change(
      screen.getByLabelText("Time (Multiple formats supported)"),
      {
        target: { value: appointmentData.time },
      },
    );
    fireEvent.change(screen.getByLabelText("Contact Name"), {
      target: { value: appointmentData.contactName },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: appointmentData.category },
    });

    const submitButton = screen.getByRole("button", {
      name: "Add Appointment",
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(appointmentData);
    });
  });

  it("clears errors when user starts typing", async () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const submitButton = screen.getByRole("button", {
      name: "Add Appointment",
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Date is required")).toBeInTheDocument();
    });

    const dateInput = screen.getByLabelText(
      "Date (Multiple formats supported)",
    );
    fireEvent.change(dateInput, { target: { value: "21-11-2025" } });

    expect(screen.queryByText("Date is required")).not.toBeInTheDocument();
  });

  it("displays today's date as a hint", () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const expectedDate = `${day}-${month}-${year}`;

    expect(screen.getByText(`Today: ${expectedDate}`)).toBeInTheDocument();
  });

  it("trims whitespace from contact name and category", async () => {
    render(
      <AddAppointmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const appointmentData = {
      date: "21-11-2025",
      time: "14:30",
      contactName: "  Peter van der Meer  ",
      category: "  Ghostin 06  ",
    };

    fireEvent.change(
      screen.getByLabelText("Date (Multiple formats supported)"),
      {
        target: { value: appointmentData.date },
      },
    );
    fireEvent.change(
      screen.getByLabelText("Time (Multiple formats supported)"),
      {
        target: { value: appointmentData.time },
      },
    );
    fireEvent.change(screen.getByLabelText("Contact Name"), {
      target: { value: appointmentData.contactName },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: appointmentData.category },
    });

    const submitButton = screen.getByRole("button", {
      name: "Add Appointment",
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        date: "21-11-2025",
        time: "14:30",
        contactName: "Peter van der Meer",
        category: "Ghostin 06",
      });
    });
  });
});
