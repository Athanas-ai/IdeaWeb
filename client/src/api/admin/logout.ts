import { clearAuthCookie, getAuthTokenFromReq } from "../_lib/auth";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  try {
    // clear cookie
    res.setHeader("Set-Cookie", clearAuthCookie());
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
