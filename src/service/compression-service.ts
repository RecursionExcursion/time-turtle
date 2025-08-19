"use server";

import { brotliCompressSync, brotliDecompressSync } from "zlib";

export async function compress<T>(t: T): Promise<string> {
  const json = JSON.stringify(t);
  const buf = Buffer.from(json);
  return brotliCompressSync(buf).toString("base64");
}

export async function decompress<T>(str: string): Promise<T> {
  const buf = Buffer.from(str, "base64");
  const out = brotliDecompressSync(buf);
  return JSON.parse(out.toString("utf-8")) as T;
}
