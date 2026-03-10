import { z } from "zod";
import { isAuthorizedAdminRequest } from "../../../api/_lib/auth";

const updateSchema = z.object({ status: z.enum(["Pending", "Approved", "In Progress", "Completed", "Rejected"]) });

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
    if (req.method !== "PATCH") return res.status(405).json({ message: "Method not allowed" });

    if (!isAuthorizedAdminRequest(req)) return res.status(401).json({ message: "Unauthorized" });

    const id = req.query?.id;
    if (!id) return res.status(400).json({ message: "Missing id" });

    const input = updateSchema.parse(req.body);
    const url = `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`;
    const r = await fetch(url, {
      method: "PATCH",
      headers: supabaseHeaders(SERVICE_KEY),
      body: JSON.stringify({ status: input.status }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ message: data?.message || "Supabase error" });
    return res.json(data[0] ?? data);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
