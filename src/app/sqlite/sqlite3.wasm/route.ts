import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";


export async function GET() {
  // Adjust path if your package layout differs. Most builds have it here:
  const wasmPath = path.resolve(
    process.cwd(),
    "node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3.wasm"
  );

  const buf = await readFile(wasmPath);

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "content-type": "application/wasm",
      "cache-control": "public, max-age=31536000, immutable",
      "cross-origin-resource-policy": "same-origin",
    },
  });
}
