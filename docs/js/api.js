// Talks to the Express API in server/. Cookies carry the session on pages
// served over http(s); opened via file:// the browser won't attach them
// (SameSite blocks cross-site cookies), so login won't persist there — but
// the cookie-free endpoints (buddies, stories, hero-slides, buddy
// applications, plan requests) work either way.
const API_BASE = "http://localhost:4000/api";

async function apiRequest(path, { method = "GET", body } = {}) {
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
    throw new Error((data && data.message) || "Something went wrong. Please try again.");
  }
  return data;
}

const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: "POST", body }),
  put: (path, body) => apiRequest(path, { method: "PUT", body }),
  patch: (path, body) => apiRequest(path, { method: "PATCH", body }),
  del: (path) => apiRequest(path, { method: "DELETE" }),
};
