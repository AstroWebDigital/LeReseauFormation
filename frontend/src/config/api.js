const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const jsonHeaders = {
  "Content-Type": "application/json",
};

async function handleResponse(response) {
  if (!response.ok) {
    let message = "Une erreur est survenue";
    try {
      const data = await response.json();
      if (data && data.message) {
        message = data.message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function apiRegister(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function apiLogin(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function apiLogout() {
  const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function apiGetProfile() {
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function apiGetHome() {
  const res = await fetch(`${API_BASE_URL}/api/home`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(res);
}
