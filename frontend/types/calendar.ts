export interface Appointment {
  id: string;
  date: string; // Format: DD-MM-YYYY
  time: string; // Format: HH:MM
  contactName: string;
  category: string;
  createdAt: string;
}

export interface CalendarData {
  appointments: Appointment[];
}

export interface AddAppointmentRequest {
  date: string;
  time: string;
  contactName: string;
  category: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AppointmentsResponse {
  appointments: Appointment[];
}

export interface AddAppointmentResponse {
  appointment: Appointment;
}

export interface DeleteAppointmentResponse {
  success: boolean;
  deletedAppointment?: Appointment;
  error?: string;
}
