# Testing

How to test the MCP server at different levels — without needing Copilot.

---

## Level 1 — Server starts

```powershell
npm run start
```

Expected:
```
[MCP Server] url-title-server started successfully
```

Server waits idle on stdin. Press **Ctrl+C** to exit.

---

## Level 2 — JSON-RPC over stdin

Send raw MCP requests directly to the server process.

### List available tools

```powershell
node -e "
const {spawn} = require('child_process');
const p = spawn('node', ['dist/server.js'], {stdio:['pipe','pipe','inherit']});
let out = '';
p.stdout.on('data', d => { out += d; });
p.stdin.write(JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list',params:{}}) + '\n');
setTimeout(() => { console.log(JSON.parse(out)); p.kill(); }, 2000);
"
```

Expected: a JSON object listing `get_url_title` with its input schema.

### Call `get_url_title`

```powershell
node -e "
const {spawn} = require('child_process');
const req = {jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_url_title',arguments:{url:'https://example.com'}}};
const p = spawn('node', ['dist/server.js'], {stdio:['pipe','pipe','inherit']});
let out = '';
p.stdout.on('data', d => { out += d; });
p.stdin.write(JSON.stringify(req) + '\n');
setTimeout(() => { console.log(JSON.parse(out).result.content[0].text); p.kill(); }, 5000);
"
```

Expected: `Example Domain`

---

## Level 3 — Error handling

### Invalid URL

```powershell
node -e "
const {spawn} = require('child_process');
const req = {jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_url_title',arguments:{url:'not-a-url'}}};
const p = spawn('node', ['dist/server.js'], {stdio:['pipe','pipe','inherit']});
let out = '';
p.stdout.on('data', d => { out += d; });
p.stdin.write(JSON.stringify(req) + '\n');
setTimeout(() => { console.log(JSON.parse(out).result.content[0].text); p.kill(); }, 2000);
"
```

Expected: `Error: Invalid URL format: "not-a-url"...`

### Blocked private IP

Use `url: "http://localhost:8080"` — expected: `Error: Access to local/private networks is not allowed`.

---

## Level 4 — Copilot integration

1. Run `npm run build`
2. Reload VS Code (**Ctrl+Shift+P** → **Developer: Reload Window**)
3. Open Copilot Chat (**Ctrl+Shift+I**)
4. Ask: `What is the title of https://wikipedia.org?`
5. Copilot calls the tool and returns `Wikipedia`

You do not need to name the tool explicitly — Copilot matches it by the tool's `description`.

---

## Level 5 — Debugger

1. Open `src/server.ts` and click a line number to set a breakpoint
2. Press **F5** → select **"Run MCP Server (ts-node)"**
3. Trigger a tool call from Copilot Chat
4. The breakpoint is hit; inspect variables in the **Variables** panel

---

## Adding a new tool (sanity check)

1. In `src/server.ts`, add a new `server.registerTool(...)` block
2. `npm run build`
3. Reload VS Code
4. Ask Copilot to use the new tool by describing what it does
