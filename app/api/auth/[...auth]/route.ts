const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

async function proxyAuthRequest(request: Request, segments: string[] = []) {
  if (!CONVEX_SITE_URL) {
    return Response.json(
      { error: "NEXT_PUBLIC_CONVEX_SITE_URL is required for auth proxying" },
      { status: 500 },
    );
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`/api/auth/${segments.join("/")}${incomingUrl.search}`, CONVEX_SITE_URL);
  const headers = new Headers(request.headers);
  headers.set("x-better-auth-forwarded-host", incomingUrl.host);
  headers.set("x-better-auth-forwarded-proto", incomingUrl.protocol.replace(":", ""));
  headers.set("x-forwarded-host", incomingUrl.host);
  headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));
  headers.delete("host");
  headers.delete("accept-encoding");
  headers.delete("content-length");
  if (!headers.has("origin")) {
    headers.set("origin", incomingUrl.origin);
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    // Required by Node fetch when forwarding a streaming request body.
    duplex: "half",
    redirect: "manual",
  } as RequestInit & { duplex: "half" });
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ auth?: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  const { auth = [] } = await context.params;
  return proxyAuthRequest(request, auth);
}

export async function POST(request: Request, context: RouteContext) {
  const { auth = [] } = await context.params;
  return proxyAuthRequest(request, auth);
}

export async function OPTIONS(request: Request, context: RouteContext) {
  const { auth = [] } = await context.params;
  return proxyAuthRequest(request, auth);
}
