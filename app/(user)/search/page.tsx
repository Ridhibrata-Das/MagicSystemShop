"use client";

import { useState, useEffect } from "react";
import { getAllProducts } from "@/services/products";
import { Product } from "@/types";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import FilterSidebar from "@/components/FilterSidebar";
import SystemWindow from "@/components/SystemWindow";
import FundsDisplay from "@/components/FundsDisplay";
import BackToDashboard from "@/components/BackToDashboard";

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts().then(res => {
      setProducts(res);
      setFilteredProducts(res);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const filtered = products.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full animate-fade-in-up">
      <BackToDashboard />
      <SystemWindow 
        title="GLOBAL ARCHIVE SEARCH"
        headerAction={
          <div className="flex items-center space-x-2 bg-black/50 border border-system-border px-3 py-1 rounded-sm shadow-system-glow">
            <span className="text-xs font-orbitron text-system-muted tracking-widest uppercase">Credits:</span>
            <FundsDisplay />
          </div>
        }
      >
        <div className="p-4 space-y-8">
           <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-64 flex-shrink-0">
                 <FilterSidebar />
              </div>
              <div className="flex-1 space-y-6">
                 <SearchBar onSearch={setSearchTerm} />
                 {loading ? (
                    <div className="py-20 text-center animate-pulse text-system-accent font-orbitron uppercase tracking-widest">
                       Accessing Archives...
                    </div>
                 ) : (
                    <ProductGrid products={filteredProducts} />
                 )}
              </div>
           </div>
        </div>
      </SystemWindow>
    </div>
  );
}
