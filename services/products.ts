import { getDocs, getDoc, query, where, orderBy, limit } from "firebase/firestore";
import { collections, getProductDoc } from "./db";
import { Product } from "@/types";
import { AestheticAnalysis } from "./visionService";

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(collections.products);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docSnap = await getDoc(getProductDoc(id));
    if (!docSnap.exists()) return null;
    return { ...docSnap.data(), id: docSnap.id } as Product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
};

export const searchProducts = async (searchQuery: string): Promise<Product[]> => {
  try {
    // Note: Firestore doesn't natively support full-text search easily.
    // We will simulate it by fetching all and filtering, or we can use prefix searching if queried correctly.
    // For a robust system we'd use Algolia/Elastic, but for now we do client-side filtering.
    const all = await getAllProducts();
    const lowerQuery = searchQuery.toLowerCase();
    return all.filter(p => p.title.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery));
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};

export const filterProducts = async (category?: string, minPrice?: number, maxPrice?: number): Promise<Product[]> => {
  try {
    let constraints = [];
    if (category) constraints.push(where("category", "==", category));
    if (minPrice !== undefined) constraints.push(where("price", ">=", minPrice));
    if (maxPrice !== undefined) constraints.push(where("price", "<=", maxPrice));
    
    const q = query(collections.products, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
  } catch (error) {
    console.error("Error filtering products:", error);
    return [];
  }
};

export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
  if (!ids || ids.length === 0) return [];
  try {
    // Fetch all and filter to avoid 10-item limit with 'in' queries
    const all = await getAllProducts();
    return all.filter(p => ids.includes(p.id));
  } catch (error) {
    console.error("Error fetching multiple products:", error);
    return [];
  }
};

export const searchByAesthetic = async (analysis: AestheticAnalysis): Promise<Product[]> => {
    try {
        const allProducts = await getAllProducts();
        
        // Ranking Scorer
        const scoredProducts = allProducts.map(product => {
            let score = 0;
            
            // 1. Style Match (+10)
            if (product.styleTags?.some(tag => tag.toLowerCase() === analysis.style.toLowerCase())) {
                score += 10;
            } else if (product.styleTags?.some(tag => analysis.keywords.some(k => k.toLowerCase().includes(tag.toLowerCase())))) {
                score += 5;
            }
            
            // 2. Color Match (+4 per color)
            analysis.colors.forEach(color => {
                if (product.colors?.some(pc => pc.toLowerCase().includes(color.toLowerCase()) || color.toLowerCase().includes(pc.toLowerCase()))) {
                    score += 4;
                }
            });
            
            // 3. Material Match (+3 per material)
            analysis.materials.forEach(material => {
                if (product.materials?.some(pm => pm.toLowerCase() === material.toLowerCase())) {
                    score += 3;
                }
            });
            
            // 4. Keyword/Vibe Match (+2 per keyword)
            analysis.keywords.forEach(keyword => {
                if (product.title.toLowerCase().includes(keyword.toLowerCase()) || 
                    product.description.toLowerCase().includes(keyword.toLowerCase()) ||
                    product.styleTags?.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))) {
                    score += 2;
                }
            });

            return { product, score };
        });

        // Filter out zero scores and sort by descending score
        return scoredProducts
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.product);

    } catch (error) {
        console.error("Error in searchByAesthetic:", error);
        return [];
    }
};
