# Quick Start

Get the MCP server running in VS Code on Windows in under 5 minutes.

## Prerequisites

- Node.js v18+ — verify with `node --version`
- VS Code with the GitHub Copilot extension

---

## 1. Install dependencies

```powershell
npm install
```

## 2. Build

```powershell
npm run build
```

No output means success. This compiles `src/server.ts` → `dist/server.js`.

## 3. Confirm the server starts

```powershell
npm run start
```

You should see:

```
[MCP Server] url-title-server started successfully
```

The server then sits idle waiting for MCP requests on stdin. Press **Ctrl+C** to stop.

## 4. Copilot integration

VS Code reads `.vscode/mcp.json` automatically. After building:

1. **Ctrl+Shift+P** → **Developer: Reload Window**
2. Open Copilot Chat (**Ctrl+Shift+I**)
3. Ask:
   > What is the title of https://wikipedia.org?

Copilot will call the `get_url_title` tool on your server and return the real page title.

---

## Corporate / proxy networks

If your network does SSL inspection, Node's built-in `fetch` will fail with `SELF_SIGNED_CERT_IN_CHAIN`.

**Set `NODE_EXTRA_CA_CERTS` once as a Windows user environment variable** — this is the recommended approach. It keeps the path out of `mcp.json` (nothing to commit) and applies to all Node.js processes automatically:

```powershell
[System.Environment]::SetEnvironmentVariable(
  "NODE_EXTRA_CA_CERTS",
  "C:\Users\YourName\your-ca.crt",
  "User"
)
```

Restart VS Code after running this. No changes to `mcp.json` needed.

See [configuration.md](configuration.md) for alternative approaches.

---

## Next steps

- [configuration.md](configuration.md) — all config options explained
- [windows-setup.md](windows-setup.md) — detailed Windows setup walkthrough
- [testing.md](testing.md) — test the server without Copilot
