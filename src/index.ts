import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// Import resources
import { registerCategoriesResource } from "./resources/categories.js";

// Import tools registrations


// Create the MCP server
const server = new McpServer({
  name: "Gousto Cookbook",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {}
  }
});

registerCategoriesResource(server);

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Gousto Cookbook MCP Server running");
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});