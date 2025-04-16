import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getCategories } from "../api/client.js";
import { Category } from "../api/types.js";

// Register the cookbook categories resource
export function registerCategoriesResource(server: McpServer): void {
  server.resource(
    "cookbook-categories",
    "cookbook://categories",
    async (uri) => {
      try {
        const data = await getCategories();
        
        // Format the categories in a more readable way
        const formattedCategories = data.data.categories.map((category: Category) => ({
          title: category.title,
          url: category.url.replace(/^\//, ''), // Remove leading slash for easier use
          uid: category.uid
        }));
        
        return {
          contents: [{
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(formattedCategories, null, 2)
          }]
        };
      } catch (error) {
        console.error(`Error fetching categories: ${error}`);
        return {
          contents: [{
            uri: uri.href,
            mimeType: "text/plain",
            text: `Error fetching cookbook categories: ${error}`
          }]
        };
      }
    }
  );
}