/* istanbul ignore file */
// Proxy route - not unit tested (thin glue code, better suited for integration tests)
import { NextRequest, NextResponse } from "next/server";

const BACKEND_ENV_VARS: Record<string, string> = {
  v1: "CALCULATOR_REST_API_V1_URL",
};

const BACKEND_URLS: Record<string, string | undefined> = Object.fromEntries(
  Object.entries(BACKEND_ENV_VARS).map(([k, v]) => [k, process.env[v]]),
);

async function proxyRequest(request: NextRequest, path: string[]) {
  const [version, ...rest] = path;
  if (!(version in BACKEND_ENV_VARS)) {
    return NextResponse.json({ error: "Unknown API version" }, { status: 404 });
  }
  const baseUrl = BACKEND_URLS[version];
  if (!baseUrl) {
    console.error(`Environment variable ${BACKEND_ENV_VARS[version]} is not set`);
    return NextResponse.json({ error: "Backend not configured" }, { status: 503 });
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
      return NextResponse.json({ error: "Service unavailable" }, { status: 502 });
    }
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Service unavailable" }, { status: 502 });
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
