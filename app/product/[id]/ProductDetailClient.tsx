"use client";

import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useSystemMessage } from "@/contexts/SystemMessageContext";
import { getCurrentUser } from "@/services/authService";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const { showMessage } = useSystemMessage();
  const searchParams = useSearchParams();
  
  const discountPercent = parseInt(searchParams.get('off') || '0');
  const discountedPrice = product.price * (1 - discountPercent / 100);
  const isDiscounted = discountPercent > 0;

  const isOutOfStock = product.stock <= 0;
  const rarity = (product.rarity as string)?.toLowerCase() || 'common';

  const rarityConfigs: Record<string, { class: string; label: string; text: string; aura: string }> = {
    common: { class: 'aura-common', label: 'Common', text: 'text-gray-400', aura: '' },
    rare: { class: 'aura-rare', label: 'Rare Grade', text: 'text-blue-400', aura: 'bg-blue-500/5' },
    epic: { class: 'aura-epic', label: 'Epic Grade', text: 'text-purple-400', aura: 'bg-purple-500/10' },
    legendary: { class: 'aura-legendary', label: 'S-Rank Legendary', text: 'text-amber-400', aura: 'bg-amber-500/15 animate-pulse' },
    mythical: { class: 'aura-mythical', label: 'EX-Rank Mythical', text: 'text-red-500', aura: 'bg-red-900/20' },
  };

  const config = rarityConfigs[rarity] || rarityConfigs.common;

  const handleAcquire = () => {
    const user = getCurrentUser();
    if (!user) {
      showMessage('Auth Required', 'Connect your entity to acquire items.', 'error');
      return;
    }
    
    addToCart(product, 1, isDiscounted ? discountedPrice : undefined);
    showMessage('Item Acquired', `${product.title} added to Inventory.`, 'success');
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 p-2 md:p-6 relative overflow-hidden ${config.aura}`}>
      {/* Background Aura Flare */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full blur-[120px] opacity-20 pointer-events-none -z-10 bg-current ${config.text}`}></div>
      {/* Left Column: Image Area */}
      <div className="space-y-4">
        <div className={`aspect-square relative overflow-hidden rounded-sm border bg-black/40 shadow-system-glow ${config.class}`}>
          {/* Decorative Corner Indents */}
          <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 z-10 ${config.text} border-current opacity-80`}></div>
          <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 z-10 ${config.text} border-current opacity-80`}></div>
          <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 z-10 ${config.text} border-current opacity-80`}></div>
          <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 z-10 ${config.text} border-current opacity-80`}></div>
          
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover opacity-90"
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-orbitron text-system-muted text-xl uppercase tracking-widest">
              No Visual Log
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Information Area */}
      <div className="flex flex-col h-full">
        <div className="mb-2 flex gap-2">
          <span className={`px-2 py-1 bg-black/40 border text-[10px] font-orbitron font-bold uppercase tracking-[0.2em] ${config.text} border-current`}>
            {config.label}
          </span>
          <span className="px-2 py-1 bg-system-accent/10 border border-system-accent text-[10px] font-orbitron text-system-accent uppercase tracking-widest">
            Class: {product.category}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-system-text font-orbitron mb-4 tracking-tighter filter drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] uppercase">
          {product.title}
        </h1>
        
        <div className="p-4 bg-white/5 border-l-2 border-system-accent mb-6">
          <p className="text-lg text-system-text font-rajdhani leading-relaxed italic opacity-90">
            "{product.description}"
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-3 border border-system-border/30 bg-black/20">
            <div className="text-[10px] font-orbitron text-system-muted uppercase tracking-widest mb-1">Exchange Value</div>
            <div className={`text-2xl font-orbitron ${isDiscounted ? 'text-system-success animate-pulse' : 'text-system-accent'} drop-shadow-[0_0_5px_rgba(0,240,255,0.6)]`}>
              {discountedPrice.toFixed(2)} G
              {isDiscounted && (
                <span className="ml-2 text-[10px] text-system-error line-through opacity-50">
                   {product.price.toFixed(2)}
                </span>
              )}
            </div>
            {isDiscounted && (
                <div className="text-[8px] font-orbitron text-system-success uppercase tracking-[0.2em] mt-1 shadow-sm">
                    Divine Offer: {discountPercent}% OFF Activated
                </div>
            )}
          </div>
          <div className="p-3 border border-system-border/30 bg-black/20">
            <div className="text-[10px] font-orbitron text-system-muted uppercase tracking-widest mb-1">Registry Status</div>
            <div className={`text-xl font-orbitron uppercase ${isOutOfStock ? 'text-system-error' : 'text-system-success'}`}>
              {isOutOfStock ? 'Depleted' : `Available (${product.stock})`}
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <button
            onClick={handleAcquire}
            disabled={isOutOfStock}
            className={`w-full relative overflow-hidden rounded-sm border-2 py-4 text-xl font-orbitron font-black uppercase tracking-[0.2em] transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-30 ${
              rarity === 'common'
              ? 'border-system-accent bg-system-accent/20 text-system-accent hover:bg-system-accent hover:text-black hover:shadow-system-glow-hover'
              : `border-current bg-current/20 ${config.text} hover:bg-current hover:text-black hover:shadow-system-glow-hover shadow-lg shadow-current/10`
            }`}
          >
            <span className="relative z-10">{isOutOfStock ? 'Out of Stock' : 'Acquire Item'}</span>
            {!isOutOfStock && (
              <div className={`absolute inset-0 -translate-x-full opacity-30 skew-x-12 transition-transform duration-500 hover:translate-x-full bg-current ${config.text}`}></div>
            )}
          </button>
          
          <div className="flex items-center justify-between text-[10px] font-mono text-system-muted uppercase tracking-widest">
            <span>ID: {product.id}</span>
            <span>SECURE LINK VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
