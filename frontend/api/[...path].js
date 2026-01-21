const getProxyTarget = () => {
  const raw =
    process.env.BACKEND_URL ||
    process.env.API_PROXY_TARGET ||
    process.env.PROXY_BACKEND_URL;

  if (!raw || typeof raw !== "string") {
    return null;
  }

  return raw.trim().replace(/\/+$/, "");
};

const readRequestBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return undefined;
  }

  return Buffer.concat(chunks);
};

export default async function handler(req, res) {
  const proxyTarget = getProxyTarget();
  if (!proxyTarget) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: "Proxy backend not configured",
        detail: "Set BACKEND_URL in the Vercel environment settings.",
      })
    );
    return;
  }

  const incomingUrl = new URL(
    req.url || "/api",
    `http://${req.headers.host || "localhost"}`
  );

  const targetUrl = new URL(
    `${incomingUrl.pathname}${incomingUrl.search}`,
    proxyTarget
  );

  const headers = new Headers();
  Object.entries(req.headers || {}).forEach(([key, value]) => {
    if (!value) return;
    const lowerKey = key.toLowerCase();
    if (lowerKey === "host" || lowerKey === "connection") return;
    if (lowerKey === "content-length") return;

    if (Array.isArray(value)) {
      headers.set(key, value.join(","));
    } else {
      headers.set(key, value);
    }
  });

  const method = req.method || "GET";
  const body = ["GET", "HEAD"].includes(method)
    ? undefined
    : await readRequestBody(req);

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    res.statusCode = upstreamResponse.status;
    upstreamResponse.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey === "transfer-encoding") return;
      res.setHeader(key, value);
    });

    const responseBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
    res.end(responseBuffer);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: "Proxy request failed",
        detail: error?.message || "Unknown error",
      })
    );
  }
}
