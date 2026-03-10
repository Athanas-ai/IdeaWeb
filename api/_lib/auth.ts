import crypto from "crypto";

const COOKIE_NAME = "cbl_auth";

export function signToken(payload: Record<string, unknown>, secret: string, expiresIn = 60 * 60 * 24 * 7) {
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresIn };
  const bodyJson = JSON.stringify(body);
  const bodyB64 = Buffer.from(bodyJson).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(bodyB64).digest("hex");
  return `${bodyB64}.${sig}`;
}

export function verifyToken(token: string, secret: string) {
  try {
    const [bodyB64, sig] = token.split(".");
    if (!bodyB64 || !sig) return null;
    const expected = crypto.createHmac("sha256", secret).update(bodyB64).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
    const bodyJson = Buffer.from(bodyB64, "base64url").toString("utf8");
    const data = JSON.parse(bodyJson);
    const now = Math.floor(Date.now() / 1000);
    if (data.exp && now > data.exp) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!cookieHeader) return map;
  cookieHeader.split(";").forEach((part) => {
    const [k, ...v] = part.split("=");
    if (!k) return;
    map[k.trim()] = decodeURIComponent((v || []).join("=").trim());
  });
  return map;
}

export function makeAuthCookie(token: string, maxAge = 60 * 60 * 24 * 7) {
  // HttpOnly, Secure, SameSite=Strict
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=Strict`;
}

export function clearAuthCookie() {
  return `${COOKIE_NAME}=deleted; Path=/; HttpOnly; Max-Age=0; SameSite=Strict`;
}

export function getAuthTokenFromReq(req: any) {
  const cookieHeader = req.headers?.cookie;
  const cookies = parseCookies(cookieHeader);
  return cookies[COOKIE_NAME];
}

export { COOKIE_NAME };
