"use server";

import { createHmac, timingSafeEqual } from "crypto";

const HMAC_SECRET = process.env.HMAC_SECRET!;
if (!HMAC_SECRET) throw Error("HMAC_SECRET not set in env");

export async function generateHmac(msg: string): Promise<string> {
  return createHmac("sha256", HMAC_SECRET).update(msg).digest("base64");
}

export async function validateHmac(
  data: string,
  expected: string
): Promise<boolean> {
  const actualHmac = await generateHmac(data);

  const actualBuf = Buffer.from(actualHmac, "base64");
  const expectedBuf = Buffer.from(expected, "base64");

  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}