/* istanbul ignore file */
// Proxy route - not unit tested (thin glue code, better suited for integration tests)
import { NextRequest, NextResponse } from "next/server";

if (!process.env.CALCULATOR_REST_API_V1_URL) {
  throw new Error("CALCULATOR_REST_API_V1_URL environment variable is required");
}

const BACKEND_URLS: Record<string, string> = {
  v1: process.env.CALCULATOR_REST_API_V1_URL,
};

async function proxyRequest(request: NextRequest, path: string[]) {
  const [version, ...rest] = path;
  const baseUrl = BACKEND_URLS[version];
  if (!baseUrl) {
    return NextResponse.json({ error: "Unknown API version" }, { status: 404 });
  }
  const endpoint = rest.join("/");
  const url = `${baseUrl}/${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text();
    if (body) {
      fetchOptions.body = body;
    }
  }

  try {
    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: `Backend unavailable (${response.status})` }, { status: 502 });
    }
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 502 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}
