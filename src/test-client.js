#!/usr/bin/env node

/**
 * Simple test client for the MCP URL Title Server.
 *
 * Spawns the compiled server as a child process and sends JSON-RPC
 * requests over stdin/stdout to verify the server responds correctly.
 *
 * Usage:
 *   npm run build
 *   node src/test-client.js
 */

import { spawn } from "child_process";

const SERVER_BIN = new URL("../dist/server.js", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

const tests = [
  {
    name: "tools/list — should return get_url_title",
    request: { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
  },
  {
    name: "get_url_title — Wikipedia",
    request: { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "get_url_title", arguments: { url: "https://www.wikipedia.org" } } },
  },
  {
    name: "get_url_title — invalid URL (error case)",
    request: { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_url_title", arguments: { url: "not-a-url" } } },
  },
  {
    name: "get_url_title — local IP blocked (error case)",
    request: { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "get_url_title", arguments: { url: "http://localhost:8080" } } },
  },
];

function runTest(test) {
  return new Promise((resolve) => {
    const proc = spawn("node", [SERVER_BIN], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
    });

    let output = "";
    proc.stdout.on("data", (chunk) => { output += chunk; });
    proc.stderr.on("data", () => {});

    proc.stdin.write(JSON.stringify(test.request) + "\n");

    setTimeout(() => {
      proc.kill();
      try {
        resolve({ ok: true, result: JSON.parse(output) });
      } catch {
        resolve({ ok: false, raw: output });
      }
    }, 5000);
  });
}

async function main() {
  console.log("MCP Server Test Client\n" + "=".repeat(40));

  for (const test of tests) {
    process.stdout.write(`\n▶ ${test.name}\n`);
    const { ok, result, raw } = await runTest(test);

    if (!ok) {
      console.log("  ✗ No valid JSON response:", raw || "(empty)");
      continue;
    }
    if (result.error) {
      console.log("  ✗ RPC error:", JSON.stringify(result.error));
      continue;
    }

    const tools   = result.result?.tools?.map((t) => t.name);
    const content = result.result?.content?.[0]?.text;

    if (tools)            console.log("  ✓ Tools:", tools.join(", "));
    else if (content !== undefined) console.log("  ✓ Response:", content);
    else                  console.log("  ✓ Raw:", JSON.stringify(result.result));
  }

  console.log("\n" + "=".repeat(40) + "\nDone.");
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
