import { Product } from "@/types";
import { filterProducts, getAllProducts } from "./products";

export const getPersonalizedRecommendations = async (
  profession: string,
  skills: string[]
): Promise<Record<string, Product[]>> => {
  const allProducts = await getAllProducts();
  const lowerProfession = profession.toLowerCase();
  const lowerSkills = skills.map(s => s.toLowerCase());

  // Define category relevance based on profession
  const professionWeights: Record<string, string[]> = {
    warrior: ["Weapons", "Armor"],
    knight: ["Weapons", "Armor"],
    mage: ["Scrolls", "Artifacts", "Potions"],
    wizard: ["Scrolls", "Artifacts", "Potions"],
    sorcerer: ["Scrolls", "Artifacts", "Potions"],
    alchemist: ["Potions", "Materials"],
    rogue: ["Weapons", "Artifacts"],
    architect: ["Materials", "Artifacts"],
    blacksmith: ["Materials", "Weapons", "Armor"],
  };

  const relevantCategories = professionWeights[lowerProfession as keyof typeof professionWeights] || ["Artifacts", "Potions"];

  const recommendations: Record<string, Product[]> = {};

  // For each relevant category, pick top 3-4 products
  for (const category of relevantCategories) {
    const categoryProducts = allProducts
      .filter(p => p.category === category)
      // Simple heuristic: match skills in description
      .sort((a, b) => {
        const aMatches = lowerSkills.filter(s => a.description.toLowerCase().includes(s)).length;
        const bMatches = lowerSkills.filter(s => b.description.toLowerCase().includes(s)).length;
        return bMatches - aMatches;
      })
      .slice(0, 4);
    
    if (categoryProducts.length > 0) {
      recommendations[category] = categoryProducts;
    }
  }

  // If we have very few recommendations, add some general ones
  if (Object.keys(recommendations).length < 2) {
    const fallbackCategories = ["Potions", "Artifacts", "Scrolls"];
    for (const cat of fallbackCategories) {
      if (!recommendations[cat]) {
        recommendations[cat] = allProducts
          .filter(p => p.category === cat)
          .slice(0, 3);
      }
    }
  }

  return recommendations;
};
