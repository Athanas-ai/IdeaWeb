import { signToken, makeAuthCookie, parseCookies, verifyToken } from '../api/_lib/auth';

async function run() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error('ADMIN_PASSWORD not set in environment');
    process.exit(1);
  }

  // Simulate login: sign token and create cookie
  const token = signToken({ admin: true }, password);
  const cookie = makeAuthCookie(token);
  console.log('Generated Set-Cookie header:\n', cookie);

  // Simulate receiving cookie and checking auth
  const parsed = parseCookies(cookie);
  const received = parsed['cbl_auth'];
  if (!received) {
    console.error('No token found in cookie');
    process.exit(1);
  }

  const verified = verifyToken(received, password);
  console.log('verifyToken result:', verified);
}

run().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
