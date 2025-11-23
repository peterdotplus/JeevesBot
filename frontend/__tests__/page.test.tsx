import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "@/app/page";
import { Appointment } from "@/types/calendar";
import { useRouter } from "next/navigation";

// Mock the fetch API
global.fetch = jest.fn();

// Mock the config utility
jest.mock("@/utils/config", () => ({
  getConfig: jest.fn(() => ({
    BACKEND_URL: "http://localhost:3001",
    NEXT_PUBLIC_APP_NAME: "JeevesBot Calendar (Development)",
    NODE_ENV: "development",
    authentication: {
      backendCredentials: {
        username: "admin",
        password: "password123",
        note: "Test credentials",
      },
    },
  })),
  getAuthCredentials: jest.fn(() => ({
    username: "admin",
    password: "password123",
    note: "Test credentials",
  })),
  buildAuthenticatedUrl: jest.fn((baseUrl: string, path: string) => {
    return `${baseUrl}${path}?username=admin&password=password123`;
  }),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock the components
jest.mock("@/components/Calendar", () => {
  return function MockCalendar({ appointments, onDeleteAppointment }: any) {
    return (
      <div data-testid="calendar">
        {appointments.map((appointment: Appointment) => (
          <div key={appointment.id}>
            <span>{appointment.contactName}</span>
            <button onClick={() => onDeleteAppointment(appointment.id)}>
              Delete {appointment.id}
            </button>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock("@/components/AddAppointmentForm", () => {
  return function MockAddAppointmentForm({ onSubmit, onCancel }: any) {
    return (
      <div data-testid="add-appointment-form">
        <button
          onClick={() =>
            onSubmit({
              date: "21-11-2025",
              time: "14:30",
              contactName: "Test Contact",
              category: "Test Category",
            })
          }
        >
          Submit Form
        </button>
        <button onClick={onCancel}>Cancel Form</button>
      </div>
    );
  };
});

const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>;

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);

    // Set authenticated state for tests
    localStorage.setItem("authenticated", "true");
  });

  afterEach(() => {
    localStorage.clear();
  });

  const mockAppointments: Appointment[] = [
    {
      id: "1",
      date: "21-11-2025",
      time: "14:30",
      contactName: "Peter van der Meer",
      category: "Ghostin 06",
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "2",
      date: "22-11-2025",
      time: "09:00",
      contactName: "Jane Smith",
      category: "Call",
      createdAt: "2024-01-01T10:00:00Z",
    },
  ];

  it("renders loading state initially", () => {
    mockFetch.mockImplementationOnce(
      () => new Promise(() => {}), // Never resolves to keep loading state
    );

    render(<Home />);

    expect(screen.getByText("Loading appointments...")).toBeInTheDocument();
    // Header is not rendered during loading state
  });

  it("renders appointments after successful fetch", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ appointments: mockAppointments }),
    } as Response);

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.queryByText("Loading appointments..."),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("Peter van der Meer")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("shows error message when fetch fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response);

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to fetch appointments"),
      ).toBeInTheDocument();
    });

    const dismissButton = screen.getByText("Dismiss");
    fireEvent.click(dismissButton);

    expect(
      screen.queryByText("Failed to fetch appointments"),
    ).not.toBeInTheDocument();
  });

  it("opens and closes add appointment form", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ appointments: [] }),
    } as Response);

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.queryByText("Loading appointments..."),
      ).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: "Add Appointment" });
    fireEvent.click(addButton);

    expect(screen.getByTestId("add-appointment-form")).toBeInTheDocument();

    const cancelButton = screen.getByText("Cancel Form");
    fireEvent.click(cancelButton);

    expect(
      screen.queryByTestId("add-appointment-form"),
    ).not.toBeInTheDocument();
  });

  it("adds new appointment successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ appointments: [] }),
    } as Response);

    const newAppointment = {
      id: "3",
      date: "21-11-2025",
      time: "14:30",
      contactName: "Test Contact",
      category: "Test Category",
      createdAt: "2024-01-01T10:00:00Z",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ appointment: newAppointment }),
    } as Response);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ appointments: [newAppointment] }),
    } as Response);

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.queryByText("Loading appointments..."),
      ).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: "Add Appointment" });
    fireEvent.click(addButton);

    const submitButton = screen.getByText("Submit Form");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByTestId("add-appointment-form"),
      ).not.toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/appointments?username=admin&password=password123",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: "21-11-2025",
          time: "14:30",
          contactName: "Test Contact",
          category: "Test Category",
        }),
      },
    );
  });

  it("deletes appointment successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ appointments: mockAppointments }),
    } as Response);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ appointments: [mockAppointments[1]] }),
    } as Response);

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.queryByText("Loading appointments..."),
      ).not.toBeInTheDocument();
    });

    const deleteButton = screen.getByText("Delete 1");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/appointments/1?username=admin&password=password123",
        {
          method: "DELETE",
        },
      );
    });
  });

  it("handles add appointment failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ appointments: [] }),
    } as Response);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to add appointment" }),
    } as Response);

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.queryByText("Loading appointments..."),
      ).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: "Add Appointment" });
    fireEvent.click(addButton);

    const submitButton = screen.getByText("Submit Form");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to add appointment")).toBeInTheDocument();
    });
  });

  it("handles delete appointment failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ appointments: mockAppointments }),
    } as Response);

    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response);

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.queryByText("Loading appointments..."),
      ).not.toBeInTheDocument();
    });

    const deleteButton = screen.getByText("Delete 1");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to delete appointment"),
      ).toBeInTheDocument();
    });
  });
});
