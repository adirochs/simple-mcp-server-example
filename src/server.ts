import * as cheerio from "cheerio";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Block private/local IP ranges for security
const LOCAL_IP_PATTERN =
  /^(localhost|127\.|192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.)/i;

async function main() {
  // 1. Create the high-level MCP server
  const server = new McpServer({
    name: "url-title-server",
    version: "1.0.0",
  });

  // 2. Register the get_url_title tool using Zod schema for validation
  server.registerTool(
    "get_url_title",
    {
      description: "Fetches the <title> element of the given URL",
      inputSchema: {
        url: z.string().describe("The URL to fetch (e.g., https://example.com)"),
      },
    },
    async ({ url }) => {
      // Validate URL format
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        return {
          content: [
            {
              type: "text",
              text: `Error: Invalid URL format: "${url}". Must be a valid HTTP(S) URL.`,
            },
          ],
        };
      }

      // Block local/private networks
      if (LOCAL_IP_PATTERN.test(parsedUrl.hostname)) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Access to local/private networks is not allowed (${parsedUrl.hostname})`,
            },
          ],
        };
      }

      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000),
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (!response.ok) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Failed to fetch URL. HTTP status ${response.status} (${response.statusText})`,
              },
            ],
          };
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text/html")) {
          return {
            content: [
              {
                type: "text",
                text: `Error: URL did not return HTML content. Content-Type: ${contentType}`,
              },
            ],
          };
        }

        const html = await response.text();

        // Parse HTML and extract <title>
        const $ = cheerio.load(html);
        const title = $("title").first().text().trim() ||
          "[No <title> element found in HTML]";

        return {
          content: [{ type: "text", text: title }],
        };
      } catch (err: any) {
        const msg: string = err?.name === "TimeoutError"
          ? "Error: Request timeout (exceeded 10 seconds)"
          : `Error fetching URL: ${err?.message ?? String(err)}`;
        return { content: [{ type: "text", text: msg }] };
      }
    }
  );

  // 3. Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[MCP Server] url-title-server started successfully");
}

main().catch((err) => {
  console.error("[MCP Server] Fatal error:", err);
  process.exit(1);
});
