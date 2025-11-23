"use client";

import React from "react";
import { Appointment } from "@/types/calendar";

interface CalendarProps {
  appointments: Appointment[];
  onDeleteAppointment: (id: string) => void;
}

export default function Calendar({
  appointments,
  onDeleteAppointment,
}: CalendarProps) {
  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const getDayName = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year!, month! - 1, day!);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return dayNames[date.getDay()];
  };

  const groupAppointmentsByDate = () => {
    const grouped: { [key: string]: Appointment[] } = {};

    appointments.forEach((appointment) => {
      if (!grouped[appointment.date]) {
        grouped[appointment.date] = [];
      }
      grouped[appointment.date].push(appointment);
    });

    // Sort dates chronologically
    return Object.keys(grouped)
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.split("-").map(Number);
        const [dayB, monthB, yearB] = b.split("-").map(Number);
        const dateA = new Date(yearA!, monthA! - 1, dayA!);
        const dateB = new Date(yearB!, monthB! - 1, dayB!);
        return dateA.getTime() - dateB.getTime();
      })
      .reduce(
        (acc, date) => {
          acc[date] = grouped[date].sort((a, b) =>
            a.time.localeCompare(b.time),
          );
          return acc;
        },
        {} as { [key: string]: Appointment[] },
      );
  };

  const groupedAppointments = groupAppointmentsByDate();

  if (appointments.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No appointments scheduled
          </h3>
          <p className="text-gray-600">
            Get started by adding your first appointment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
        <div key={date} className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {getDayName(date)} {formatDate(date)}
              </h3>
              <p className="text-gray-600 text-sm">
                {dayAppointments.length} appointment
                {dayAppointments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {dayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {appointment.time}
                    </span>
                    <span className="text-sm text-gray-600">
                      {appointment.category}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">
                    {appointment.contactName}
                  </h4>
                </div>

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this appointment?",
                      )
                    ) {
                      onDeleteAppointment(appointment.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete appointment"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
