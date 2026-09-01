import { NextResponse } from "next/server";
import { getClientIp } from "./http.js";

const store = new Map();

function check(key, { windowMs, max }) {
  const now = Date.now();
  let entry = store.get(key);
  if (!entry || now - entry.start > windowMs) {
    entry = { start: now, count: 0 };
  }
  entry.count += 1;
  store.set(key, entry);
  return entry.count <= max;
}

export function rateLimit(request, name, { windowMs, max, message }) {
  const ip = getClientIp(request);
  const key = `${name}:${ip}`;
  if (!check(key, { windowMs, max })) {
    return NextResponse.json({ error: message }, { status: 429 });
  }
  return null;
}

export const loginLimiter = (request) => rateLimit(request, "login", {
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again in 15 minutes.",
});

export const passwordLimiter = (request) => rateLimit(request, "password", {
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many password attempts. Please try again in an hour.",
});

export const apiLimiter = (request) => rateLimit(request, "api", {
  windowMs: 60 * 1000,
  max: 120,
  message: "Too many requests. Please slow down.",
});
