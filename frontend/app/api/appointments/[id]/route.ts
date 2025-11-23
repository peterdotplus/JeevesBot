import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const BACKEND_USERNAME = process.env.BACKEND_USERNAME || "admin";
const BACKEND_PASSWORD = process.env.BACKEND_PASSWORD || "password123";
const BACKEND_AUTH =
  "Basic " +
  Buffer.from(`${BACKEND_USERNAME}:${BACKEND_PASSWORD}`).toString("base64");

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Appointment ID is required",
        },
        { status: 400 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/appointments/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: BACKEND_AUTH,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete appointment");
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      deletedAppointment: data.data?.deletedAppointment,
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete appointment",
      },
      { status: 500 },
    );
  }
}
