import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRecipesByCategory } from "../api/client.js";
import { DEFAULT_RECIPE_LIMIT, MAX_RECIPE_LIMIT } from "../utils/config.js";
import { Recipe } from "../api/types.js";

// Register the get-recipes-by-category tool
export function registerGetRecipesByCategoryTool(server: McpServer): void {
  server.tool(
    "get-recipes-by-category",
    "Get a list of recipes from a specific category",
    {
      category: z.string().describe("Category URL slug (e.g. 'healthy-choices', 'chicken-recipes', etc.)"),
      limit: z.number().min(1).max(MAX_RECIPE_LIMIT).default(DEFAULT_RECIPE_LIMIT).describe(`Number of recipes to return (max ${MAX_RECIPE_LIMIT})`)
    },
    async ({ category, limit }) => {
      try {
        // Remove leading slash if present
        const cleanCategory = category.replace(/^\//, '');
        
        const data = await getRecipesByCategory(cleanCategory, limit);
        
        if (!data.data || !data.data.entries || data.data.entries.length === 0) {
          return {
            content: [{ type: "text", text: `No recipes found for category: ${cleanCategory}` }]
          };
        }

        const recipes = data.data.entries.map((recipe: Recipe) => ({
          title: recipe.title,
          url: recipe.url,
          slug: recipe.url.replace(/^\//, ''), // For easy lookup later
          prep_time: recipe.prep_times?.for_2 || "unknown",
          rating: recipe.rating ? `${recipe.rating.average}/5 (${recipe.rating.count} ratings)` : "No ratings",
          image: recipe.media?.images?.[2]?.image || "No image available"
        }));

        const totalRecipes = data.data.count || recipes.length;
        
        const formattedResponse = `Found ${totalRecipes} recipes in category '${cleanCategory}' (showing ${recipes.length}):\n\n` +
          recipes.map((recipe: any, index: number) => 
            `${index + 1}. ${recipe.title}\n` +
            `   Prep time: ${recipe.prep_time} minutes\n` +
            `   Rating: ${recipe.rating}\n` +
            `   URL slug: ${recipe.slug}`
          ).join("\n\n");

        return {
          content: [{ type: "text", text: formattedResponse }]
        };
      } catch (error) {
        console.error(`Error fetching recipes: ${error}`);
        return {
          content: [{ type: "text", text: `Error fetching recipes: ${error}` }],
          isError: true
        };
      }
    }
  );
}