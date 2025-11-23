import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import LoginPage from "@/app/login/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the config utility
jest.mock("@/utils/config", () => ({
  getAuthCredentials: jest.fn(() => ({
    username: "testuser",
    password: "testpass",
    note: "Test credentials",
  })),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);

    // Clear localStorage
    localStorage.clear();
  });

  it("renders login form with all elements", () => {
    render(<LoginPage />);

    expect(screen.getByText("JeevesBot Calendar")).toBeInTheDocument();
    expect(
      screen.getByText("Your digital assistant for business management"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows error for invalid credentials", async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    fireEvent.change(usernameInput, { target: { value: "wronguser" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Invalid username or password"),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(localStorage.getItem("authenticated")).toBeNull();
  });

  it("successfully logs in with correct credentials", async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    expect(localStorage.getItem("authenticated")).toBe("true");
    expect(localStorage.getItem("username")).toBe("testuser");
  });

  it("shows loading state during authentication", async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Signing in/)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText("Signing in...")).not.toBeInTheDocument();
    });
  });

  it("clears error when user starts typing again", async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    // First submit with wrong credentials to show error
    fireEvent.change(usernameInput, { target: { value: "wrong" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Invalid username or password"),
      ).toBeInTheDocument();
    });

    // Start typing again
    fireEvent.change(usernameInput, { target: { value: "testuser" } });

    await waitFor(() => {
      expect(
        screen.queryByText("Invalid username or password"),
      ).not.toBeInTheDocument();
    });
  });

  it("requires both username and password", async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    // Try with empty username
    fireEvent.change(passwordInput, { target: { value: "testpass" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid username or password/),
      ).toBeInTheDocument();
    });

    // Clear and try with empty password
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid username or password/),
      ).toBeInTheDocument();
    });
  });
});
