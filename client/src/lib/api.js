const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiBaseUrl = configuredApiUrl || (import.meta.env.DEV ? "http://localhost:3000" : "");

export function apiUrl(path) {
  if (!apiBaseUrl) {
    throw new Error("VITE_API_URL must be set to the deployed Express API URL.");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl.replace(/\/+$/, "")}${normalizedPath}`;
}
