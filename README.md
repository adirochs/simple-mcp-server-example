# MCP URL Title Server

A minimal [Model Context Protocol](https://spec.modelcontextprotocol.io/) server that exposes a single tool — `get_url_title` — which fetches the `<title>` element from any given URL.

Designed as a working example of MCP + GitHub Copilot integration in VS Code on Windows.

---

## How it works

```
You (Copilot Chat) → "What is the title of https://example.com?"
       ↓
Copilot sees get_url_title tool is available
       ↓
Copilot sends: tools/call { name: "get_url_title", arguments: { url: "..." } }
       ↓
Server fetches the URL, parses the HTML, returns the <title> text
       ↓
Copilot: "The title is Example Domain"
```

The server speaks JSON-RPC over stdin/stdout (stdio transport). VS Code starts it automatically when needed via `.vscode/mcp.json`.

---

## Stack

- **Runtime:** Node.js 18+ (uses built-in `fetch`)
- **Language:** TypeScript — `module: "NodeNext"` for proper ESM + exports map resolution
- **MCP SDK:** `@modelcontextprotocol/sdk` — `McpServer` + `registerTool()`
- **HTML parsing:** `cheerio`

---

## Quick start

```powershell
npm install
npm run build
```

Then reload VS Code — Copilot will pick up the server from `.vscode/mcp.json` automatically.

→ Full walkthrough: [docs/quickstart.md](docs/quickstart.md)

---

## Project structure

```
src/
  server.ts          ← MCP server — edit here to add tools
dist/                ← compiled output (npm run build)
.vscode/
  mcp.json           ← VS Code MCP server registration
  launch.json        ← F5 debug configurations
  tasks.json         ← build tasks
docs/
  quickstart.md      ← 5-minute setup
  configuration.md   ← all config options explained
  windows-setup.md   ← detailed Windows walkthrough
  testing.md         ← testing without Copilot
  checklist.md       ← verify your setup
```

---

## Tool: `get_url_title`

| | |
|--|--|
| **Input** | `url: string` — any HTTP(S) URL |
| **Output** | The `<title>` text, or a descriptive error message |
| **Timeout** | 10 seconds |
| **Security** | Blocks requests to private/local IP ranges |

---

## npm scripts

| Script | What it does |
|--------|-------------|
| `npm run build` | Compile `src/` → `dist/` |
| `npm run start` | Run source via ts-node (dev mode) |
| `npm run serve` | Run compiled `dist/server.js` |

---

## Documentation

| | |
|--|--|
| [docs/quickstart.md](docs/quickstart.md) | Get running in 5 minutes |
| [docs/configuration.md](docs/configuration.md) | `mcp.json`, tsconfig, tool registration |
| [docs/windows-setup.md](docs/windows-setup.md) | Detailed Windows + VS Code walkthrough |
| [docs/testing.md](docs/testing.md) | Test the server without Copilot |
| [docs/checklist.md](docs/checklist.md) | Verify your setup step by step |

---

## License

MIT

This is a working example of an **MCP server**—a process that:

1. Listens on stdin/stdout for JSON-RPC requests
2. Declares tools (e.g., `get_url_title`) with input/output schemas
3. Executes those tools when called by an MCP client (like Copilot)
4. Returns results to the client

**Key benefit:** Instead of Copilot "guessing" web content, your MCP server **actually fetches** the URL and extracts the real `<title>` tag deterministically.

---

## Quick Start (Windows + VS Code)

### 1. Install Dependencies

```bash
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

Or run in watch/dev mode:

```bash
npm run dev
```

### 3. Test the Server Locally

#### Option A: Run in VS Code debugger

1. Press **F5** or go to **Run → Start Debugging**
2. Select **"Run MCP Server (ts-node)"** from the dropdown
3. The server will start listening on stdin/stdout
4. To stop, press **Ctrl+C** in the integrated terminal or click the stop button

#### Option B: Run from terminal

```bash
npm run start
```

The process sits idle—it's waiting for MCP messages on stdin. Press **Ctrl+C** to exit.

### 4. Verify Communication (Test Client)

Once the server is running, you can test it with a simple client:

```bash
node src/test-client.js
```

(See `src/test-client.js` for an example test harness.)

---

## Configure in GitHub Copilot

GitHub Copilot's MCP integration looks for an MCP server configuration. The exact location may vary by Copilot version, but here's the general approach:

### VS Code Settings (Recommended)

The `.vscode/settings.json` in this project includes:

```json
{
  "copilot.experimental.mcpServers": {
    "url-title": {
      "command": "node",
      "args": ["--loader", "ts-node/esm", "src/server.ts"],
      "env": {
        "NODE_NO_WARNINGS": "1"
      },
      "disabled": false
    }
  }
}
```

**Important:** Replace the `args` path if your server is installed elsewhere.

### Alternative: Global Copilot Config

Some Copilot versions may also check:
- `~/.config/Copilot/mcp.json` (Linux/Mac)
- `%APPDATA%\Copilot\mcp.json` (Windows)

Check the latest GitHub Copilot documentation for the canonical location.

---

## Using the Tool from Copilot Chat

Once Copilot is configured:

1. Open Copilot Chat in VS Code (Ctrl+Shift+I)
2. Type a request like:

   > Use the MCP tool `get_url_title` to fetch the title of https://wikipedia.org

3. Copilot will:
   - Recognize the tool is available
   - Call your MCP server
   - Receive the page title (e.g., "Wikipedia")
   - Respond in chat with the result

---

## Project Structure

```
.
├── src/
│   ├── server.ts          # MCP server implementation
│   └── test-client.js     # Example test harness (optional)
├── dist/                  # Compiled JavaScript (after npm run build)
├── package.json
├── tsconfig.json
├── .vscode/
│   ├── settings.json      # Copilot MCP config
│   ├── launch.json        # Debug configurations
│   └── tasks.json         # Build/run tasks
└── README.md
```

---

## MCP Tool: `get_url_title`

### Input Schema

```json
{
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "description": "The URL to fetch (e.g., https://example.com)"
    }
  },
  "required": ["url"],
  "additionalProperties": false
}
```

### Output Format

Returns a text response with:
- **Success:** The `<title>` text from the page
- **Error:** A descriptive error message

### Examples

**Success:**
```
Input:  { "url": "https://www.wikipedia.org" }
Output: "Wikipedia"
```

**Error (invalid URL):**
```
Input:  { "url": "not a url" }
Output: "Error: Invalid URL format..."
```

**Error (timeout):**
```
Input:  { "url": "https://very-slow-site.example.com" }
Output: "Error: Request timeout (exceeded 10 seconds)"
```

---

## Debugging & Troubleshooting

### 1. Server starts but Copilot doesn't find it

- Check `.vscode/settings.json` has the correct `command` and `args`
- Verify `npm install` completed successfully
- Make sure the path in `args` is correct for your setup

### 2. "Command not found: node"

- Ensure Node.js is installed: `node --version`
- On Windows, restart VS Code after installing Node

### 3. Server crashes with "Cannot find module"

- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall
- Check TypeScript compilation: `npm run build`

### 4. MCP requests fail with "Unknown tool"

- Verify the tool name is `get_url_title` (case-sensitive)
- Check the `tools/list` handler in `src/server.ts` exports the tool

### 5. URL fetching fails

- The server blocks private IPs (127.x.x.x, 192.168.x.x, etc.) for security
- Check network/proxy settings if behind a corporate firewall
- The server has a 10-second timeout; very slow sites may fail

---

## Development & Extending

### Add a New Tool

1. Update `src/server.ts`:
   - Add the tool to the `tools/list` handler
   - Create a handler function
   - Add a case in the `tools/call` handler

Example:

```typescript
{
  name: "get_page_metadata",
  description: "Fetches Open Graph metadata from a URL",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string" }
    },
    required: ["url"],
    additionalProperties: false
  }
}
```

2. Rebuild and restart:

```bash
npm run build
npm run start
```

### Testing Locally

Create a test file to send MCP messages:

```typescript
// Test: call get_url_title with stdin/stdout
const request = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "get_url_title",
    arguments: { url: "https://example.com" }
  }
};

console.log(JSON.stringify(request));
```

Pipe to the server:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | npm run start
```

---

## How It Differs from "Just Prompting"

| Aspect | Just Prompt | With MCP |
|--------|-------------|----------|
| **Actual HTTP** | Model guesses/hallucinates | Real fetch at query time |
| **Determinism** | Changes across runs | Same URL → same result |
| **Control** | None | Full: timeouts, headers, security |
| **Debugging** | Opaque | Log every call, inspect errors |
| **Extensibility** | Hard to add new "abilities" | Easy to add new tools |

---

## References

- [Model Context Protocol (MCP) Specification](https://spec.modelcontextprotocol.io/)
- [GitHub Copilot Extensions](https://github.com/features/copilot)
- [Node.js Fetch API](https://nodejs.org/docs/latest/api/fetch.html)
- [Cheerio – jQuery-like HTML parsing](https://cheerio.js.org/)

---

## License

MIT
