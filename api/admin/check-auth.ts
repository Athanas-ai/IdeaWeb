import { getAuthTokenFromReq, verifyToken } from "../_lib/auth.js";
import { getAdminPassword } from "../../shared/admin-auth.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  try {
    const token = getAuthTokenFromReq(req);
    if (!token) return res.json({ authenticated: false });
    const adminPassword = getAdminPassword();
    const data = verifyToken(token, adminPassword);
    if (!data) return res.json({ authenticated: false });
    return res.json({ authenticated: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
