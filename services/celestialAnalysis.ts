export interface AnalysisResult {
    skip: boolean;
    needs_visual: boolean;
    suggested_item?: {
        name: string;
        id?: string;
    };
}

/**
 * Analyzes the celestial conversation to determine if an item should be manifested as a suggestion.
 */
export class CelestialAnalysisService {
    async analyzeConversation(userQuery: string, agentResponse: string): Promise<AnalysisResult> {
        console.log('[CelestialAnalysis] Inspecting frequencies:', { userQuery, agentResponse });

        // Logic to detect if the AI recommended an item
        // We look for patterns like "[SUGGEST:Item Name]" or mentions of product names
        const suggestMatch = agentResponse.match(/\[SUGGEST:(.*?)\]/);
        
        if (suggestMatch && suggestMatch[1]) {
            return {
                skip: false,
                needs_visual: true,
                suggested_item: {
                    name: suggestMatch[1].trim()
                }
            };
        }

        return {
            skip: true,
            needs_visual: false
        };
    }
}

export const celestialAnalysisService = new CelestialAnalysisService();
