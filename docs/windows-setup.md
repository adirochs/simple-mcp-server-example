# Windows Setup

Detailed walkthrough for getting the project running on Windows with VS Code.

## Prerequisites

| Requirement | Check |
|-------------|-------|
| Node.js v18+ | `node --version` |
| npm | `npm --version` |
| VS Code | [code.visualstudio.com](https://code.visualstudio.com) |
| GitHub Copilot extension | VS Code Extensions marketplace |

---

## 1. Open the project

```powershell
cd f:\projects\personal\github\simple-mcp-server-example
code .
```

---

## 2. Install dependencies

```powershell
npm install
```

This installs:
- `@modelcontextprotocol/sdk` — MCP server library
- `cheerio` — HTML parser
- `typescript`, `ts-node` — build tools

**No `node-fetch`** — the server uses Node's built-in `fetch` (available since Node 18).

---

## 3. Build

```powershell
npm run build
```

Compiles `src/server.ts` → `dist/server.js`. No output means success.

---

## 4. Test the server starts

```powershell
npm run start
```

Expected output:
```
[MCP Server] url-title-server started successfully
```

The server waits idle on stdin — this is correct. Press **Ctrl+C** to exit.

---

## 5. Configure VS Code MCP

`.vscode/mcp.json` already exists in the project. VS Code reads it automatically to know how to launch the server. No `settings.json` changes needed.

If you are on a **corporate / proxy network** with SSL inspection, add your CA certificate path to the `env` block:

```json
{
  "servers": {
    "url-title": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/dist/server.js"],
      "env": {
        "NODE_EXTRA_CA_CERTS": "C:\\Users\\YourName\\your-ca.crt",
        "NODE_NO_WARNINGS": "1"
      }
    }
  }
}
```

> **Important:** Use the Windows path format (`C:\Users\...`). The Git Bash format (`/c/Users/...`) will not be found by Node.js on Windows.

---

## 6. Reload VS Code

**Ctrl+Shift+P** → **Developer: Reload Window**

VS Code will start the MCP server and Copilot will have access to the `get_url_title` tool.

---

## 7. Test with Copilot

1. Open Copilot Chat — **Ctrl+Shift+I**
2. Ask anything that involves fetching a page title, for example:
   > What is the title of https://github.com?
3. Copilot will call `get_url_title` and return the real title.

---

## Debugging

Press **F5** to start the server under the VS Code debugger. You can set breakpoints in `src/server.ts` and they will be hit when Copilot calls the tool.

---

## Troubleshooting

### `Cannot find module` on startup

```powershell
npm install
npm run build
```

### Tool not found in Copilot Chat

- Confirm `dist/server.js` exists (`npm run build`)
- Confirm `.vscode/mcp.json` is present and valid JSON
- Reload VS Code: **Ctrl+Shift+P** → **Developer: Reload Window**

### `fetch failed` / SSL error

Set `NODE_EXTRA_CA_CERTS` in `.vscode/mcp.json` (see step 5 above).

### `node` is not recognized

Node.js is not in your PATH. Restart VS Code (or PowerShell) after installing Node.

### Server starts but exits immediately

This is normal when running from a terminal with no stdin — the server only stays alive when a client (VS Code / Copilot) is connected.
