// Talks to the Express API in server/. Cookies carry the session, so every
// request needs credentials: "include" — without it the browser won't send
// or accept the httpOnly auth cookie across the 5173 -> 4000 origin gap.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", body } = {}) {
  // FormData (file uploads) needs its own multipart boundary — let the
  // browser set that Content-Type header itself, don't JSON-encode it.
  const isFormData = body instanceof FormData;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      headers: body && !isFormData ? { "Content-Type": "application/json" } : undefined,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Is it running?");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
};
