"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  getConfig,
  getAuthCredentials,
  buildAuthenticatedUrl,
} from "@/utils/config";

// Dynamically import components to avoid SSR issues
const Calendar = dynamic(() => import("@/components/Calendar"), {
  ssr: false,
  loading: () => <div>Loading calendar...</div>,
});

const AddAppointmentForm = dynamic(
  () => import("@/components/AddAppointmentForm"),
  {
    ssr: false,
    loading: () => <div>Loading form...</div>,
  },
);

import { Appointment } from "@/types/calendar";

export default function Home() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client flag to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication on component mount (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const authStatus = localStorage.getItem("authenticated");
    if (authStatus) {
      setIsAuthenticated(true);
      fetchAppointments();
    } else {
      window.location.href = "/login";
    }
  }, [isClient]);

  const fetchAppointments = async () => {
    if (!isClient) return;

    try {
      setIsLoading(true);
      const config = getConfig();
      const auth = getAuthCredentials();
      const backendUrl = config.BACKEND_URL;
      const backendUsername = auth.username;
      const backendPassword = auth.password;

      if (!backendUrl || !backendUsername || !backendPassword) {
        throw new Error("Backend configuration is missing");
      }

      const url = buildAuthenticatedUrl(backendUrl, "/api/appointments");
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data.data?.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAppointment = async (
    appointmentData: Omit<Appointment, "id" | "createdAt">,
  ) => {
    if (!isClient) return;

    try {
      const config = getConfig();
      const auth = getAuthCredentials();
      const backendUrl = config.BACKEND_URL;
      const backendUsername = auth.username;
      const backendPassword = auth.password;

      if (!backendUrl || !backendUsername || !backendPassword) {
        throw new Error("Backend configuration is missing");
      }

      const url = buildAuthenticatedUrl(backendUrl, "/api/appointments");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add appointment");
      }

      setShowAddForm(false);
      await fetchAppointments(); // Refresh the list
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add appointment",
      );
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!isClient) return;

    try {
      const config = getConfig();
      const auth = getAuthCredentials();
      const backendUrl = config.BACKEND_URL;
      const backendUsername = auth.username;
      const backendPassword = auth.password;

      if (!backendUrl || !backendUsername || !backendPassword) {
        throw new Error("Backend configuration is missing");
      }

      const url = buildAuthenticatedUrl(backendUrl, `/api/appointments/${id}`);
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete appointment");
      }

      await fetchAppointments(); // Refresh the list
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete appointment",
      );
    }
  };

  // During static export, show loading state
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                JeevesBot Calendar
              </h1>
              <p className="text-gray-600 text-sm">
                Your digital assistant for business management
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  localStorage.removeItem("authenticated");
                  localStorage.removeItem("username");
                  window.location.href = "/login";
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Appointment
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        <Calendar
          appointments={appointments}
          onDeleteAppointment={handleDeleteAppointment}
        />

        {/* Add Appointment Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <AddAppointmentForm
                onSubmit={handleAddAppointment}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
