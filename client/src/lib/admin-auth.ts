export const ADMIN_PASSWORD_STORAGE_KEY = "cbl_admin_password";

export function getStoredAdminPassword() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) || "";
}

export function setStoredAdminPassword(password: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, password);
}

export function clearStoredAdminPassword() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
}

export function getAdminRequestHeaders() {
  const password = getStoredAdminPassword();
  const headers: Record<string, string> = {};
  if (password) {
    headers["x-admin-password"] = password;
  }
  return headers;
}
