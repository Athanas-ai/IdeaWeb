import { getAuthTokenFromReq, verifyToken } from "../_lib/auth";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supabaseHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: "return=representation",
  };
}

export default async function handler(req: any, res: any) {
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(500).json({ message: "Supabase not configured" });
  try {
    const token = getAuthTokenFromReq(req);
    if (!token || !verifyToken(token, process.env.ADMIN_PASSWORD || "")) return res.status(401).json({ message: "Unauthorized" });

    const id = req.query?.id;
    if (!id) return res.status(400).json({ message: "Missing id" });

    if (req.method === "DELETE") {
      const url = `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`;
      const r = await fetch(url, { method: "DELETE", headers: supabaseHeaders(SERVICE_KEY) });
      if (!r.ok) {
        const data = await r.json().catch(() => null);
        return res.status(r.status).json({ message: data?.message || "Supabase error" });
      }
      return res.status(204).end();
    }

    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
