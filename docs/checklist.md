# Setup Checklist

Use this to verify each stage of the setup on Windows + VS Code.

---

## Prerequisites

- [ ] `node --version` shows v18 or later
- [ ] VS Code is installed
- [ ] GitHub Copilot extension is installed in VS Code

---

## Install & build

- [ ] `npm install` completes without errors
- [ ] `node_modules/` folder exists
- [ ] `npm run build` completes without errors
- [ ] `dist/server.js` exists

---

## Server starts

- [ ] `npm run start` shows `[MCP Server] url-title-server started successfully`
- [ ] No error messages appear

---

## VS Code MCP configuration

- [ ] `.vscode/mcp.json` exists
- [ ] `args` points to `dist/server.js` (or `src/server.ts` for dev mode)
- [ ] On a corporate network: `NODE_EXTRA_CA_CERTS` is set to the Windows path of your CA cert
- [ ] VS Code has been reloaded after any `mcp.json` change (**Ctrl+Shift+P** → **Developer: Reload Window**)

---

## Copilot integration

- [ ] Open Copilot Chat (**Ctrl+Shift+I**)
- [ ] Ask: _"What is the title of https://example.com?"_
- [ ] Copilot calls the tool and responds with `Example Domain`

---

## Debugging

- [ ] Set a breakpoint in `src/server.ts`
- [ ] Press **F5** → **"Run MCP Server (ts-node)"**
- [ ] Trigger a tool call from Copilot Chat
- [ ] Breakpoint is hit

---

## If something is wrong

| Symptom | Fix |
|---------|-----|
| `Cannot find module` | `npm install` then `npm run build` |
| Tool not found in Copilot | Confirm `dist/server.js` exists; reload VS Code |
| `fetch failed` / SSL error | Set `NODE_EXTRA_CA_CERTS` in `.vscode/mcp.json` (Windows path) |
| `node` not recognized | Restart VS Code after installing Node.js |
| Breakpoint not hit | Make sure you selected the **"Run MCP Server (ts-node)"** config in F5 |
