"use client";

import React from "react";
import {
  parseDateInput,
  parseTimeInput,
  isValidDate,
  isValidTime,
  getTodayDate,
  getSupportedDateFormats,
  getSupportedTimeFormats,
} from "@/utils/dateTime";

import { useState } from "react";
import { Appointment } from "@/types/calendar";

interface AddAppointmentFormProps {
  onSubmit: (appointmentData: Omit<Appointment, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export default function AddAppointmentForm({
  onSubmit,
  onCancel,
}: AddAppointmentFormProps) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    contactName: "",
    category: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Date validation (flexible formats)
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const parsedDate = parseDateInput(formData.date);
      if (!parsedDate) {
        newErrors.date =
          "Invalid date format. Supported: DD-MM-YYYY, DD-MM-YY, DD.MM.YYYY, DD.MM.YY, DDMMYY, DDMMYYYY";
      } else if (
        !isValidDate(parsedDate.day, parsedDate.month, parsedDate.year)
      ) {
        newErrors.date = "Invalid date (does not exist in calendar)";
      }
    }

    // Time validation (flexible formats)
    if (!formData.time) {
      newErrors.time = "Time is required";
    } else {
      const parsedTime = parseTimeInput(formData.time);
      if (!parsedTime) {
        newErrors.time = "Invalid time format. Supported: HH:MM, HH.MM";
      } else if (!isValidTime(parsedTime.hours, parsedTime.minutes)) {
        newErrors.time =
          "Invalid time. Hours must be 00-23, minutes must be 00-59";
      }
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Parse and normalize date and time formats
      const parsedDate = parseDateInput(formData.date);
      const parsedTime = parseTimeInput(formData.time);

      const normalizedData = {
        date: parsedDate?.formatted || formData.date,
        time: parsedTime?.formatted || formData.time,
        contactName: formData.contactName.trim(),
        category: formData.category.trim(),
      };
      onSubmit(normalizedData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const getTodayDateFormatted = () => {
    return getTodayDate();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Add New Appointment
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date (Multiple formats supported)
          </label>
          <input
            type="text"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            placeholder="e.g., 21-11-2025, 21.11.2025, 211125"
            className={`input-field ${errors.date ? "border-red-300 focus:ring-red-500" : ""}`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Today: {getTodayDateFormatted()}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: {getSupportedDateFormats().join(", ")}
          </p>
        </div>

        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Time (Multiple formats supported)
          </label>
          <input
            type="text"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            placeholder="e.g., 14:30, 14.30"
            className={`input-field ${errors.time ? "border-red-300 focus:ring-red-500" : ""}`}
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: {getSupportedTimeFormats().join(", ")}
          </p>
        </div>

        <div>
          <label
            htmlFor="contactName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Contact Name
          </label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="e.g., Peter van der Meer"
            className={`input-field ${errors.contactName ? "border-red-300 focus:ring-red-500" : ""}`}
          />
          {errors.contactName && (
            <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Ghostin 06"
            className={`input-field ${errors.category ? "border-red-300 focus:ring-red-500" : ""}`}
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1">
            Add Appointment
          </button>
        </div>
      </form>
    </div>
  );
}
