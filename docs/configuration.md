# Configuration Reference

All configuration options for the MCP URL Title Server.

---

## `.vscode/mcp.json`

This is the only file VS Code needs to discover and launch the MCP server. It lives at `.vscode/mcp.json` in the workspace root.

```json
{
  "servers": {
    "url-title": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/dist/server.js"],
      "env": {
        "NODE_NO_WARNINGS": "1"
      }
    }
  }
}
```

### Fields

| Field | Description |
|-------|-------------|
| `type` | Transport — always `"stdio"` for this server |
| `command` | Executable — `"node"` |
| `args` | Path to the compiled server. `${workspaceFolder}` resolves to the project root |
| `env` | Extra environment variables passed to the server process |

### Running modes

**Production (recommended) — compiled output:**
```json
"args": ["${workspaceFolder}/dist/server.js"]
```
Requires `npm run build` first. Fast startup, no TypeScript overhead.

**Development — ts-node with ESM loader:**
```json
"args": ["--loader", "ts-node/esm", "${workspaceFolder}/src/server.ts"]
```
No build step needed. Slower startup, useful when iterating on `server.ts`.

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NODE_EXTRA_CA_CERTS` | Path to a CA certificate bundle. Required on networks with SSL inspection (corporate proxies). See below for the recommended setup. |
| `NODE_NO_WARNINGS` | Set to `"1"` to suppress Node.js deprecation warnings in the VS Code output panel. |

### `NODE_EXTRA_CA_CERTS` — enterprise / corporate networks

On Windows enterprise networks, outbound HTTPS traffic is often intercepted by a corporate proxy using a self-signed CA. Node's built-in `fetch` will reject the connection with `SELF_SIGNED_CERT_IN_CHAIN` unless it trusts that CA.

**Recommended: set it once as a Windows user environment variable.**  
This keeps the path out of `mcp.json` (nothing to commit) and makes it available to every Node.js process on your machine — not just the MCP server.

```powershell
# Run once in PowerShell — persists across reboots
[System.Environment]::SetEnvironmentVariable(
  "NODE_EXTRA_CA_CERTS",
  "C:\Users\YourName\your-ca.crt",
  "User"
)
```

Restart VS Code after running this. The MCP server will inherit the variable automatically and no changes to `mcp.json` are needed.

**Alternative: reference it explicitly in `mcp.json` without hardcoding the path.**  
VS Code supports `${env:VAR}` substitution in `mcp.json`. Set a named user environment variable (e.g. `CORP_CA_CERT`) and reference it:

```json
"env": {
  "NODE_EXTRA_CA_CERTS": "${env:CORP_CA_CERT}",
  "NODE_NO_WARNINGS": "1"
}
```

This makes the dependency visible to teammates who clone the repo (they see `CORP_CA_CERT` and know what to set) while keeping the actual path out of source control.

> **Windows path format required.** Always use `C:\Users\...` — the Git Bash format `/c/Users/...` is not recognised by Node.js on Windows.

---

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
  }
}
```

`module: "NodeNext"` and `moduleResolution: "NodeNext"` are required. They enable proper resolution of the MCP SDK's `package.json` exports map — without this, TypeScript cannot locate the SDK's type declarations and produces `TS2589` (infinite type instantiation) errors.

---

## `package.json` scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `build` | `tsc` | Compile `src/` → `dist/` |
| `start` | `node --loader ts-node/esm src/server.ts` | Run source directly via ts-node |
| `dev` | same as `start` | Alias for development |
| `serve` | `node dist/server.js` | Run compiled output |

---

## Registering a tool in `server.ts`

Use `server.registerTool()` (the `server.tool()` overload is deprecated):

```typescript
server.registerTool(
  "tool_name",
  {
    description: "What this tool does — this text guides the LLM on when to call it",
    inputSchema: {
      param: z.string().describe("Description of the parameter"),
    },
  },
  async ({ param }) => {
    return {
      content: [{ type: "text", text: "result" }],
    };
  }
);
```

The `description` is the primary signal the LLM uses to decide whether to call your tool. Write it to match the natural language queries you expect.

---

## Adding more servers

Multiple MCP servers can be registered in the same `mcp.json`:

```json
{
  "servers": {
    "url-title": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/dist/server.js"]
    },
    "another-server": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/path/to/other-server/dist/index.js"]
    }
  }
}
```
