import { z } from "zod";
import { signToken, makeAuthCookie } from "../_lib/auth.js";
import { getAdminPassword } from "../../shared/admin-auth.js";

const bodySchema = z.object({ password: z.string() });

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  try {
    const input = bodySchema.parse(req.body);
    const adminPassword = getAdminPassword();
    if (input.password !== adminPassword) return res.status(401).json({ message: "Invalid password" });

    const token = signToken({ admin: true }, adminPassword);
    const cookie = makeAuthCookie(token);
    res.setHeader("Set-Cookie", cookie);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: "Invalid input" });
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
