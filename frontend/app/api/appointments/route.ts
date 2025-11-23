import { NextResponse } from "next/server";

const BACKEND_AUTH =
  "Basic " + Buffer.from("admin:password123").toString("base64");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/appointments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: BACKEND_AUTH,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      appointments: data.data?.appointments || [],
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch appointments",
        appointments: [],
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: BACKEND_AUTH,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add appointment");
    }

    const data = await response.json();

    return NextResponse.json({
      appointment: data.data?.appointment,
    });
  } catch (error) {
    console.error("Error adding appointment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to add appointment",
      },
      { status: 500 },
    );
  }
}
