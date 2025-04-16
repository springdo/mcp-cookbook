import fetch from "node-fetch";
import { 
  CookbookResponse, 
  RecipesResponse, 
  RecipeDetailResponse 
} from "./types.js";

import { 
  COOKBOOK_ENDPOINT, 
  RECIPES_ENDPOINT, 
  RECIPE_ENDPOINT 
} from "../utils/config.js";

// Generic fetch function for API requests
export async function fetchData<T>(url: string): Promise<T> {
  try {
    console.error(`Fetching data from: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText} (${response.status})`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`API Error: ${error}`);
    throw error;
  }
}

// Get all cookbook categories
export async function getCategories(): Promise<CookbookResponse> {
  return await fetchData<CookbookResponse>(COOKBOOK_ENDPOINT);
}

// Get recipes by category with pagination
export async function getRecipesByCategory(category: string, limit: number = 10, offset: number = 0): Promise<RecipesResponse> {
  const url = `${RECIPES_ENDPOINT}?category=${category}&limit=${limit}&offset=${offset}`;
  return await fetchData<RecipesResponse>(url);
}

// Get recipe details by URL slug (from the URL path)
export async function getRecipeDetailsBySlug(slug: string): Promise<RecipeDetailResponse> {
  const url = `${RECIPE_ENDPOINT}/${slug}`;
  return await fetchData<RecipeDetailResponse>(url);
}