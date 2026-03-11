import { z } from "zod";
import { isAuthorizedAdminRequest } from "../_lib/auth.js";

const createSchema = z.object({
  name: z.string().min(1).transform((s) => s.trim()),
  phone: z.string().min(3).transform((s) => s.trim()),
  idea: z.string().min(1).transform((s) => s.trim()),
});

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
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ message: "Supabase not configured" });
  }

  try {
    if (req.method === "GET") {
      if (!isAuthorizedAdminRequest(req)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const url = `${SUPABASE_URL}/rest/v1/orders?select=*`;
      const r = await fetch(url, { headers: supabaseHeaders(SERVICE_KEY) });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ message: data?.message || "Supabase error" });
      return res.json(data);
    }

    if (req.method === "POST") {
      // create order (public insert) - validate and forward to Supabase using service key
      const input = createSchema.parse(req.body);

      // simple phone validation (digits, +, spaces, hyphen)
      const phoneNormalized = input.phone.replace(/[^0-9+\- ]/g, "").trim();
      if (phoneNormalized.length < 6) return res.status(400).json({ message: "Invalid phone" });

      const url = `${SUPABASE_URL}/rest/v1/orders`;
      const payload = { name: input.name, phone: phoneNormalized, idea: input.idea };
      const r = await fetch(url, {
        method: "POST",
        headers: supabaseHeaders(SERVICE_KEY),
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ message: data?.message || "Supabase error" });
      return res.status(201).json(data[0] ?? data);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end();
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
