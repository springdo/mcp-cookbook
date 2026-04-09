import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { Request, Response } from "express";

// Import resources
import { registerCategoriesResource } from "./resources/categories.js";

// Import tool registrations
import { registerGetRecipeDetailsTool } from "./tools/getRecipeDetails.js";
import { registerGetRecipesByCategoryTool } from "./tools/getRecipesByCategories.js";
import { registerSearchRecipesTool } from "./tools/searchRecipesByCategory.js";
import { registerSearchTopRecipesTool } from "./tools/searchTopRecipes.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

function createServer(): McpServer {
  const server = new McpServer({
    name: "Gousto Cookbook",
    version: "1.0.0"
  });

  registerCategoriesResource(server);
  registerGetRecipesByCategoryTool(server);
  registerGetRecipeDetailsTool(server);
  registerSearchRecipesTool(server);
  registerSearchTopRecipesTool(server);

  return server;
}

const app = createMcpExpressApp({ host: "0.0.0.0" });

// POST /mcp — client-to-server messages
app.post("/mcp", async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = createServer();
  res.on("finish", () => server.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// GET /mcp — server-to-client SSE stream
app.get("/mcp", async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = createServer();
  res.on("finish", () => server.close());
  await server.connect(transport);
  await transport.handleRequest(req, res);
});

app.listen(PORT, () => {
  console.log(`Gousto Cookbook MCP Server running on http://localhost:${PORT}/mcp`);
});
