import { NextResponse } from "next/server";

export async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function getClientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}
