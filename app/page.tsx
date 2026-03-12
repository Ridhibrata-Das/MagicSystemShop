import { Suspense } from "react";
import { filterProducts } from "@/services/products";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import FilterSidebar from "@/components/FilterSidebar";
import SystemWindow from "@/components/SystemWindow";
import FundsDisplay from "@/components/FundsDisplay";
import AuthRedirect from "@/components/AuthRedirect";

export const dynamic = "force-dynamic";

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await props.searchParams;
  const q = typeof sp.q === 'string' ? sp.q : undefined;
  const category = typeof sp.category === 'string' ? sp.category : undefined;
  const minP = typeof sp.minP === 'string' ? Number(sp.minP) : undefined;
  const maxP = typeof sp.maxP === 'string' ? Number(sp.maxP) : undefined;

  let products = await filterProducts(category, minP, maxP);
  
  if (q) {
    const lowerQ = q.toLowerCase();
    products = products.filter(p => 
      p.title.toLowerCase().includes(lowerQ) || 
      p.description.toLowerCase().includes(lowerQ)
    );
  }

  return (
    <div className="w-full flex-grow animate-fade-in-up pt-4">
      <AuthRedirect />
      <SystemWindow 
        title="System Shop" 
        headerAction={
          <div className="flex items-center space-x-2 bg-black/50 border border-system-border px-3 py-1 rounded-sm shadow-system-glow">
            <span className="text-xs font-orbitron text-system-muted tracking-widest uppercase">Current Funds:</span>
            <FundsDisplay />
          </div>
        }
      >
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 w-full max-w-lg">
            <Suspense fallback={<div className="h-10 w-full bg-system-bg border border-system-border rounded-sm animate-pulse-glow"></div>}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <Suspense fallback={<div className="h-64 w-full bg-system-bg border border-system-border rounded-sm animate-pulse-glow"></div>}>
              <FilterSidebar />
            </Suspense>
          </aside>
          
          <div className="flex-1">
            <ProductGrid products={products} />
          </div>
        </div>
      </SystemWindow>
    </div>
  );
}
