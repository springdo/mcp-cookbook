// API response types

export interface Category {
  title: string;
  url: string;
  uid: string;
}

export interface CookbookResponse {
  status: string;
  data: {
    title: string;
    description: string;
    categories: Category[];
  };
}

export interface Image {
  image: string;
  width: number;
}

export interface Rating {
  average: number;
  count: number;
}

export interface PrepTimes {
  for_2: number;
  for_4?: number;
}

export interface Recipe {
  uid: string;
  gousto_uid: string;
  title: string;
  url: string;
  media?: {
    images?: Image[];
  };
  rating?: Rating;
  prep_times?: PrepTimes;
}

export interface RecipesResponse {
  status: string;
  data: {
    count: number;
    entries: Recipe[];
  };
  meta: {
    skip: number;
    limit: number;
  };
}

export interface Ingredient {
  label: string;
  name: string;
  media?: {
    images?: Image[];
  };
  allergens?: {
    allergen: { slug: string }[];
  };
}

export interface CookingInstruction {
  instruction: string;
  order: number;
  media?: {
    images?: Image[];
  };
}

export interface Allergen {
  title: string;
  slug: string;
}

export interface NutritionalInformation {
  per_hundred_grams?: {
    energy_kcal: number;
    protein_mg: number;
    carbs_mg: number;
    fat_mg: number;
    [key: string]: number;
  };
  per_portion?: {
    energy_kcal: number;
    protein_mg: number;
    carbs_mg: number;
    fat_mg: number;
    [key: string]: number;
  };
}

export interface RecipeDetail {
  url: string;
  title: string;
  description: string;
  gousto_id: string;
  gousto_uid: string;
  categories: Category[];
  ingredients: Ingredient[];
  cooking_instructions: CookingInstruction[];
  allergens: Allergen[];
  cuisine?: {
    slug: string;
    title: string;
  };
  prep_times: PrepTimes;
  rating?: Rating;
  nutritional_information?: NutritionalInformation;
  media?: {
    images?: Image[];
  };
}

export interface RecipeDetailResponse {
  status: string;
  data: {
    entry: RecipeDetail;
  };
}