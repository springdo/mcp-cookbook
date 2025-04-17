import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRecipesByCategory } from "../api/client.js";
import { MAX_PAGE_LIMIT, DEFAULT_PAGE_LIMIT, MAX_SEARCH_LIMIT, DEFAULT_SEARCH_LIMIT } from "../utils/config.js";
import { Recipe } from "../api/types.js";

// Register the search-recipes tool
export function registerSearchTopRecipesTool(server: McpServer): void {
  server.tool(
    "search-top-recipes",
    "Search for recipes by keyword across the top 900 or more recipes",
    {
      keyword: z.string().describe("Search term to find in recipe titles"),
      pagination: z.number().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT)
        .describe(`Number of requests to make (60 items per response up to 15 pages total) (max ${MAX_PAGE_LIMIT})`),
    },
    async ({ keyword, pagination }) => {
      try {
        console.error(`registerSearchTopRecipesTool :: keyword=${keyword} , pagination=${pagination}`)
        const category = 'recipes'
        const searchResults: any[] = [];  
        for (let index = 0; index <= pagination; index++) {
          try {
            // getRecipesByCategory(category: string, limit: number = 10, offset: number = 0)
            const data = await getRecipesByCategory(category, 60, 60 * index); 
            if (data.data && data.data.entries) {
              // Filter recipes that match the keyword
              const matchingRecipes = data.data.entries.filter((recipe: Recipe) => 
                recipe.title.toLowerCase().includes(keyword.toLowerCase())
              );
              
              // Add matching recipes to results with no limits, up to the limit
              for (const recipe of matchingRecipes) {
                  searchResults.push({
                    title: recipe.title,
                    url: recipe.url,
                    slug: recipe.url.replace(/^\//, ''), // For easy lookup later
                    prep_time: recipe.prep_times?.for_2 || "unknown",
                    rating: recipe.rating ? `${recipe.rating.average}/5 (${recipe.rating.count} ratings)` : "No ratings",
                    image: recipe.media?.images?.[2]?.image || "No image available"
                  });
              }
            }
          } catch (error) {
            // Continue searching other categories if one fails
            console.error(`Error searching category ${category}: ${error}`);
          }
        }
        
        // Return results
        if (searchResults.length === 0) {
          return {
            content: [{ type: "text", text: `No recipes found matching keyword: ${keyword}` }]
          };
        }
        
        const formattedResponse = `Found ${searchResults.length} recipes matching '${keyword}':\n\n` +
          searchResults.map((recipe, index) => 
            `${index + 1}. ${recipe.title}\n` +
            `   Prep time: ${recipe.prep_time} minutes\n` +
            `   Rating: ${recipe.rating}\n` +
            `   URL slug: ${recipe.slug}`
          ).join("\n\n");
        
        return {
          content: [{ type: "text", text: formattedResponse }]
        };
      } catch (error) {
        console.error(`Error searching recipes: ${error}`);
        return {
          content: [{ type: "text", text: `Error searching recipes: ${error}` }],
          isError: true
        };
      }
    }
  );
}