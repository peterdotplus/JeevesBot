import express from "express";
import {
  getAllAppointments,
  addAppointment,
  deleteAppointment,
  parseAppointmentInput,
  Appointment,
} from "../services/calendarService";

const router = express.Router();

/**
 * GET /api/appointments
 * Get all appointments
 */
router.get("/", (req, res) => {
  try {
    const appointments = getAllAppointments();

    res.status(200).json({
      success: true,
      data: {
        appointments,
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch appointments",
    });
  }
});

/**
 * POST /api/appointments
 * Add a new appointment
 */
router.post("/", (req, res) => {
  try {
    const { date, time, contactName, category } = req.body;

    // Validate required fields
    if (!date || !time || !contactName || !category) {
      return res.status(400).json({
        success: false,
        error: "All fields are required: date, time, contactName, category",
      });
    }

    // Validate date format (DD-MM-YYYY)
    if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: "Date must be in DD-MM-YYYY format",
      });
    }

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({
        success: false,
        error: "Time must be in HH:MM format",
      });
    }

    // Validate date components
    const [day, month, year] = date.split("-").map(Number);
    const appointmentDate = new Date(year, month - 1, day);
    if (
      appointmentDate.getDate() !== day ||
      appointmentDate.getMonth() !== month - 1 ||
      appointmentDate.getFullYear() !== year
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid date",
      });
    }

    // Validate time components
    const [hours, minutes] = time.split(":").map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return res.status(400).json({
        success: false,
        error: "Invalid time. Hours must be 00-23, minutes must be 00-59",
      });
    }

    const appointmentData: Omit<Appointment, "id" | "createdAt"> = {
      date,
      time,
      contactName,
      category,
    };

    const appointment = addAppointment(appointmentData);

    return res.status(201).json({
      success: true,
      data: {
        appointment,
      },
    });
  } catch (error) {
    console.error("Error adding appointment:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to add appointment",
    });
  }
});

/**
 * DELETE /api/appointments/:id
 * Delete an appointment by ID
 */
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Appointment ID is required",
      });
    }

    const appointments = getAllAppointments();
    const appointmentIndex = appointments.findIndex((appt) => appt.id === id);

    if (appointmentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found",
      });
    }

    // Use the deleteAppointment function (note: it uses 1-based index for display)
    const result = deleteAppointment(appointmentIndex + 1);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        deletedAppointment: result.deletedAppointment,
      },
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete appointment",
    });
  }
});

/**
 * POST /api/appointments/parse
 * Parse appointment input from natural language
 */
router.post("/parse", (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: "Input text is required",
      });
    }

    const result = parseAppointmentInput(input);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        appointment: result.appointment,
      },
    });
  } catch (error) {
    console.error("Error parsing appointment input:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to parse appointment input",
    });
  }
});

export default router;
