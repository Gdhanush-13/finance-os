import { type NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function proxy(req: NextRequest) {
  const url = new URL(req.url);
  const targetUrl = `${BACKEND}${url.pathname}${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!["host", "connection"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  let body: BodyInit | undefined;
  if (!["GET", "HEAD"].includes(req.method)) {
    body = await req.arrayBuffer();
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await response.arrayBuffer();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Backend unavailable. Please try again later." } },
      { status: 503 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
