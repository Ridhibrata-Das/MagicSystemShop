"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { getProductsByIds } from "@/services/products";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SystemWindow from "@/components/SystemWindow";

export default function CartPage() {
  const { items, updateQuantity, removeItem, isLoading } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadProducts() {
      if (items.length > 0) {
        setLoadingProducts(true);
        const productIds = items.map(i => i.productId);
        const fetchedProducts = await getProductsByIds(productIds);
        
        const map: Record<string, Product> = {};
        fetchedProducts.forEach(p => { map[p.id] = p; });
        setProducts(map);
      }
      setLoadingProducts(false);
    }
    
    if (!isLoading) {
      loadProducts();
    }
  }, [items, isLoading]);

  const subtotal = items.reduce((total, item) => total + (item.priceSnapshot * item.quantity), 0);

  if (isLoading || loadingProducts) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-system-accent"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex-grow animate-fade-in-up pt-4">
      <SystemWindow title="INVENTORY">
        
        {items.length === 0 ? (
          <div className="text-center py-16 bg-black/40 rounded-sm border border-system-border/30 shadow-inner">
            <h4 className="font-orbitron tracking-widest uppercase text-system-muted mb-2 opacity-80">[ SYSTEM MESSAGE ]</h4>
            <h3 className="text-xl font-orbitron font-bold text-system-text drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">Inventory Empty</h3>
            <p className="mt-2 text-sm text-system-muted">Acquire items from the Shop.</p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center rounded-sm border border-system-accent bg-system-accent/10 px-6 py-2 text-sm font-orbitron font-bold uppercase tracking-widest text-system-accent shadow-system-glow transition-colors hover:bg-system-accent hover:text-black focus:outline-none focus:ring-1 focus:ring-system-accent"
              >
                Return to Shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => {
                const product = products[item.productId];
                if (!product) return null;
                
                return (
                  <div key={item.productId} className="relative group flex flex-col bg-black/60 border border-system-border rounded-sm overflow-hidden transition-all hover:border-system-accent hover:shadow-system-glow-hover">
                    <div className="aspect-square relative flex items-center justify-center p-2 bg-gradient-to-br from-black to-[#050a14]">
                      {product.imageUrl ? (
                        <div className="relative w-full h-full border border-system-border/30">
                          <Image src={product.imageUrl} alt={product.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ) : (
                        <div className="text-[10px] font-orbitron text-system-muted tracking-widest">UNKNOWN</div>
                      )}
                      
                      <div className="absolute top-1 left-1 bg-black/80 px-1 border border-system-border text-[10px] font-orbitron text-system-accent">
                        x{item.quantity}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="absolute top-1 right-1 bg-system-error/20 border border-system-error/50 w-5 h-5 flex items-center justify-center text-[10px] text-system-error opacity-0 group-hover:opacity-100 transition-opacity hover:bg-system-error hover:text-white"
                        title="Discard"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-3 flex flex-col flex-1 border-t border-system-border/50">
                      <h3 className="text-xs font-orbitron font-bold text-system-text line-clamp-1 truncate" title={product.title}>
                        {product.title}
                      </h3>
                      <div className="mt-1 flex justify-between items-center text-[10px] font-orbitron text-system-muted">
                        <span>{product.price.toFixed(2)} G</span>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1} className="w-4 h-4 rounded-sm bg-system-border border border-transparent hover:border-system-accent disabled:opacity-30 disabled:hover:border-transparent flex items-center justify-center text-black">
                            -
                          </button>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= product.stock} className="w-4 h-4 rounded-sm bg-system-border border border-transparent hover:border-system-accent disabled:opacity-30 disabled:hover:border-transparent flex items-center justify-center text-black">
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-black/50 border top-4 border-system-border p-6 mt-4">
              <h2 className="text-sm font-orbitron font-bold uppercase tracking-widest text-system-accent border-b border-system-border/50 pb-2 mb-4">Transaction Summary</h2>
              
              <dl className="space-y-4 font-rajdhani">
                <div className="flex items-center justify-between text-system-muted">
                  <dt>Subtotal Value</dt>
                  <dd className="font-orbitron">{subtotal.toFixed(2)} G</dd>
                </div>
                <div className="flex items-center justify-between font-bold text-lg text-system-text border-t border-system-border/30 pt-4">
                  <dt>Total Value</dt>
                  <dd className="font-orbitron font-bold text-system-accent drop-shadow-[0_0_5px_rgba(0,240,255,0.6)]">{subtotal.toFixed(2)} G</dd>
                </div>
              </dl>

              <div className="mt-8">
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full relative overflow-hidden bg-system-accent/10 border border-system-accent py-3 px-4 rounded-sm text-sm font-orbitron font-bold uppercase tracking-widest text-system-accent transition-all hover:bg-system-accent hover:text-black hover:shadow-system-glow focus:outline-none"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        )}
      </SystemWindow>
    </div>
  );
}
