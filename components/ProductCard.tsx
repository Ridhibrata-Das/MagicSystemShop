"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useSystemMessage } from "@/contexts/SystemMessageContext";
import { getCurrentUser } from "@/services/authService";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { showMessage } = useSystemMessage();
  const isOutOfStock = product.stock <= 0;
  const rarity = (product.rarity as string)?.toLowerCase() || 'common';
  
  const rarityConfigs: Record<string, { class: string; label: string; text: string }> = {
    common: { class: 'aura-common', label: 'Common', text: 'text-gray-400' },
    rare: { class: 'aura-rare', label: 'Rare', text: 'text-blue-400' },
    epic: { class: 'aura-epic', label: 'Epic', text: 'text-purple-400' },
    legendary: { class: 'aura-legendary', label: 'Legendary', text: 'text-amber-400' },
    mythical: { class: 'aura-mythical', label: 'Mythical', text: 'text-red-500' },
  };

  const config = rarityConfigs[rarity] || rarityConfigs.common;

  const handleAcquire = (e: React.MouseEvent) => {
    e.stopPropagation();
    const user = getCurrentUser();
    if (!user) {
      showMessage('Auth Required', 'Connect your entity to acquire items.', 'error');
      return;
    }
    
    addToCart(product);
    showMessage('Item Acquired', `${product.title} added to Inventory.`, 'success');
  };

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-sm border bg-system-bg transition-all duration-300 hover:-translate-y-1 ${config.class} ${rarity === 'mythical' ? 'hover:shadow-none' : 'hover:shadow-system-glow-hover'}`}>
      {/* Corner indicators */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-system-accent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-system-accent opacity-50"></div>
      
      <Link href={`/product/${product.id}`} className="aspect-square relative overflow-hidden bg-black/60 border-b border-system-border/50 block">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110 opacity-80 hover:opacity-100"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-orbitron text-system-muted text-xs">NO ASSET</div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
          <span className={`px-2 py-0.5 rounded-sm text-[8px] font-orbitron font-bold border uppercase tracking-tighter shadow-sm ${config.text} border-current bg-black/60`}>
            {config.label}
          </span>
          {isOutOfStock ? (
            <span className="rounded-sm bg-system-error/20 border border-system-error/50 shadow-system-error px-2 py-1 text-[10px] font-orbitron text-system-error uppercase tracking-wider">
              Depleted
            </span>
          ) : (
            <span className="rounded-sm bg-system-success/20 border border-system-success/50 shadow-system-success px-2 py-1 text-[10px] font-orbitron text-system-success uppercase tracking-wider">
              Available
            </span>
          )}
        </div>
      </Link>
      
      <div className="flex flex-1 flex-col p-4 z-10">
        <div className="mb-1 text-[10px] font-orbitron text-system-accent uppercase tracking-[0.2em]">{product.category}</div>
        <Link href={`/product/${product.id}`} className="hover:text-system-accent transition-colors">
          <h3 className="mb-2 text-lg font-bold text-system-text line-clamp-1 filter drop-shadow-[0_0_2px_rgba(255,255,255,0.5)] uppercase">{product.title}</h3>
        </Link>
        <p className="mb-4 text-sm text-system-muted line-clamp-2 flex-grow">{product.description}</p>
        
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-system-border/30">
          <span className="text-xl font-orbitron text-system-accent drop-shadow-[0_0_5px_rgba(0,240,255,0.6)]">
            {product.price.toFixed(2)} G
          </span>
          <button
            onClick={handleAcquire}
            disabled={isOutOfStock}
            className={`relative overflow-hidden rounded-sm border py-1.5 px-4 text-sm font-orbitron font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-30 ${
              rarity === 'common' 
              ? 'border-system-accent bg-system-accent/10 text-system-accent hover:bg-system-accent hover:text-black hover:shadow-system-glow focus:ring-system-accent'
              : `border-current bg-current/10 ${config.text} hover:bg-current hover:text-black focus:ring-current`
            }`}
            aria-label={`Acquire ${product.title}`}
          >
            <span className="relative z-10">Acquire</span>
            <div className="absolute inset-0 -translate-x-full bg-system-accent/20 transition-transform duration-300 group-hover:translate-x-0"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
