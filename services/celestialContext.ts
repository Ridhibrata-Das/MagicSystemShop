import { getAllProducts } from './products';

export interface CelestialVariables {
    productCount: number;
    magicalRegistries: string;
    systemTime: string;
    protocolState: string;
}

let lastFetchedProducts: any[] = [];

/**
 * Refreshes the celestial context by fetching latest registry data.
 */
export async function refreshCelestialContext() {
    try {
        lastFetchedProducts = await getAllProducts();
    } catch (e) {
        console.error('[CelestialContext] Failed to fetch magical registries:', e);
    }
}

/**
 * Returns formatted variables for the Gemini model context.
 */
export function getCelestialVariables(): CelestialVariables {
    const products = lastFetchedProducts.map(p => ({
        name: p.title,
        price: p.price,
        stock: p.stock > 0 ? 'AVAILABLE' : 'MANIFESTING'
    }));

    return {
        productCount: products.length,
        magicalRegistries: JSON.stringify(products),
        systemTime: new Date().toLocaleTimeString(),
        protocolState: 'ACTIVE_OBSERVER'
    };
}
/**
 * Returns the configuration for the Gemini Live API.
 */
export async function getCelestialConfig(): Promise<any> {
    await refreshCelestialContext();
    const vars = getCelestialVariables();
    
    return {
        systemInstruction: {
            parts: [{
                text: `You are the Celestial Intelligence, a divine observer of this magical shop. 
                Your frequency is calibrated to help entities find mystical items in our registry.
                
                MAGICAL_REGISTRIES:
                ${vars.magicalRegistries}
                
                CURRENT_SYSTEM_TIME: ${vars.systemTime}
                PROTOCOL_STATE: ${vars.protocolState}
                
                GUIDELINES:
                1. Speak with a divine, ethereal, yet helpful tone.
                2. If an entity mentions a need, suggest a relevant item from our registry.
                3. Use the format [SUGGEST:item_name] when you want to highlight a product.
                4. Focus on the item names, prices, and stock levels provided.
                5. Keep responses concise and atmospheric.`
            }]
        }
    };
}
