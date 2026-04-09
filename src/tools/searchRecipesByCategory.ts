import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getCategories, getRecipesByCategory } from "../api/client.js";
import { DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT } from "../utils/config.js";
import { Recipe } from "../api/types.js";

// Register the search_recipes tool
export function registerSearchRecipesTool(server: McpServer): void {
  server.tool(
    "search_recipes_by_category",
    "Search for recipes by keyword across categories",
    {
      keyword: z.string().describe("Search term to find in recipe titles"),
      limit: z.number().min(1).max(MAX_SEARCH_LIMIT).default(DEFAULT_SEARCH_LIMIT)
        .describe(`Number of recipes to return (max ${MAX_SEARCH_LIMIT})`)
    },
    async ({ keyword, limit }) => {
      try {
        console.info(`registerSearchRecipesTool :: keyword=${keyword} , limit=${limit}`)
        // Get categories to search through
        const categoriesData = await getCategories();
        const categories = categoriesData.data.categories
          .map(category => category.url.replace(/^\//, ''))
          .slice(0, 15); // Limit to 15 categories to keep response times reasonable
        
        // Track found recipes and total count
        const searchResults: any[] = [];
        let totalFound = 0;
        
        // Search through categories
        for (const category of categories) {
          if (totalFound >= limit) break;
          
          try {
            const data = await getRecipesByCategory(category, 50); // Get up to 50 recipes from each category
            
            if (data.data && data.data.entries) {
              // Filter recipes that match the keyword
              const matchingRecipes = data.data.entries.filter((recipe: Recipe) => 
                recipe.title.toLowerCase().includes(keyword.toLowerCase())
              );
              
              // Add matching recipes to results, up to the limit
              for (const recipe of matchingRecipes) {
                if (totalFound < limit) {
                  searchResults.push({
                    title: recipe.title,
                    url: recipe.url,
                    slug: recipe.url.replace(/^\//, ''), // For easy lookup later
                    prep_time: recipe.prep_times?.for_2 || "unknown",
                    rating: recipe.rating ? `${recipe.rating.average}/5 (${recipe.rating.count} ratings)` : "No ratings",
                    image: recipe.media?.images?.[2]?.image || "No image available"
                  });
                  totalFound++;
                }
                
                if (totalFound >= limit) break;
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