import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRecipeDetailsBySlug } from "../api/client.js";

// Register the get-recipe-details tool
export function registerGetRecipeDetailsTool(server: McpServer): void {
  server.tool(
    "get-recipe-details",
    "Get detailed information about a specific recipe",
    {
      recipeSlug: z.string().describe("Recipe URL slug (e.g. 'sticky-chilli-chicken-breast-with-salt-pepper-chips' or 'chicken-recipes/smoky-spanish-chicken-patatas-bravas-aioli')"),
    },
    async ({ recipeSlug }) => {
      try {
        // Remove leading slash if present
        let cleanSlug = recipeSlug.replace(/^\//, '');
        
        // Try to get the recipe details
        const data = await getRecipeDetailsBySlug(cleanSlug);
        
        if (!data.data || !data.data.entry) {
          return {
            content: [{ type: "text", text: `Recipe not found: ${cleanSlug}` }],
            isError: true
          };
        }

        const recipe = data.data.entry;
        
        // Format ingredients list
        const ingredients = recipe.ingredients.map((ingredient) => 
          `- ${ingredient.label || ingredient.name}`
        ).join("\n");

        // Format cooking instructions (removing HTML tags)
        const instructions = recipe.cooking_instructions
          .sort((a, b) => a.order - b.order)
          .map((step) => {
            // Extract text from HTML
            const text = step.instruction.replace(/<\/?[^>]+(>|$)/g, "");
            return `Step ${step.order}: ${text}`;
          })
          .join("\n\n");

        // Format allergens
        const allergensList = recipe.allergens.length > 0 
          ? recipe.allergens.map(a => a.title).join(", ")
          : "None listed";

        // Format nutritional information
        const nutritionInfo = recipe.nutritional_information?.per_portion
          ? `Calories: ${recipe.nutritional_information.per_portion.energy_kcal || "Not available"} kcal\n` +
            `Protein: ${recipe.nutritional_information.per_portion.protein_mg ? (recipe.nutritional_information.per_portion.protein_mg / 1000).toFixed(1) + "g" : "Not available"}\n` +
            `Carbs: ${recipe.nutritional_information.per_portion.carbs_mg ? (recipe.nutritional_information.per_portion.carbs_mg / 1000).toFixed(1) + "g" : "Not available"}\n` +
            `Fat: ${recipe.nutritional_information.per_portion.fat_mg ? (recipe.nutritional_information.per_portion.fat_mg / 1000).toFixed(1) + "g" : "Not available"}`
          : "Nutritional information not available";

        // Create formatted response
        const formattedResponse = `# ${recipe.title}\n\n` +
          `${recipe.description || "No description available"}\n\n` +
          `**Preparation Time:** ${recipe.prep_times.for_2} minutes (for 2 servings)\n` +
          `**Cuisine:** ${recipe.cuisine?.title || "Not specified"}\n` +
          `**Rating:** ${recipe.rating ? `${recipe.rating.average}/5 (${recipe.rating.count} ratings)` : "No ratings"}\n\n` +
          `## Ingredients\n\n${ingredients}\n\n` +
          `## Instructions\n\n${instructions}\n\n` +
          `## Allergens\n\n${allergensList}\n\n` +
          `## Nutritional Information (per portion)\n\n${nutritionInfo}`;

        return {
          content: [{ type: "text", text: formattedResponse }]
        };
      } catch (error) {
        console.error(`Error fetching recipe details: ${error}`);
        return {
          content: [{ type: "text", text: `Error fetching recipe details: ${error}` }],
          isError: true
        };
      }
    }
  );
}