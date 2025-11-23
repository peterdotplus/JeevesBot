"use client";

import React from "react";

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

    // Date validation (DD-MM-YYYY format)
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.date)) {
      newErrors.date = "Date must be in DD-MM-YYYY format";
    } else {
      const [day, month, year] = formData.date.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      if (
        date.getDate() !== day ||
        date.getMonth() !== month - 1 ||
        date.getFullYear() !== year
      ) {
        newErrors.date = "Invalid date";
      }
    }

    // Time validation (HH:MM format)
    if (!formData.time) {
      newErrors.time = "Time is required";
    } else if (!/^\d{2}:\d{2}$/.test(formData.time)) {
      newErrors.time = "Time must be in HH:MM format";
    } else {
      const [hours, minutes] = formData.time.split(":").map(Number);
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        newErrors.time = "Invalid time";
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
      const trimmedData = {
        ...formData,
        contactName: formData.contactName.trim(),
        category: formData.category.trim(),
      };
      onSubmit(trimmedData);
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

  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
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
            Date (DD-MM-YYYY)
          </label>
          <input
            type="text"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            placeholder="e.g., 21-11-2025"
            className={`input-field ${errors.date ? "border-red-300 focus:ring-red-500" : ""}`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Today: {getTodayDate()}</p>
        </div>

        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Time (HH:MM)
          </label>
          <input
            type="text"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            placeholder="e.g., 14:30"
            className={`input-field ${errors.time ? "border-red-300 focus:ring-red-500" : ""}`}
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time}</p>
          )}
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
