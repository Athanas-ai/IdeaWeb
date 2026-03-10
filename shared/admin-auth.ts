export const DEFAULT_ADMIN_PASSWORD = "Khublei@123";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}
