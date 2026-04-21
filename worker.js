const PREFLIGHT_INIT = {
  status: 204,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "*",
  },
};

addEventListener("fetch", (e) => {
  e.respondWith(handle(e.request));
});

async function handle(req) {
  const url = new URL(req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, PREFLIGHT_INIT);
  }
  
  if (url.pathname.startsWith("/v2/")) {
    const targetUrl = "https://registry-1.docker.io" + url.pathname + url.search;
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (!["host", "cf-connecting-ip"].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    }
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });
    
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "*");
    
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  }
  
  return new Response("Docker Proxy Ready", {
    headers: { "Content-Type": "text/plain" },
  });
}
