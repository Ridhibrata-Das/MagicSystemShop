import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductById } from "@/services/products";
import SystemWindow from "@/components/SystemWindow";
import FundsDisplay from "@/components/FundsDisplay";
import { Product } from "@/types";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="w-full flex-grow animate-fade-in-up pt-4 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link 
          href="/" 
          className="text-system-accent font-orbitron text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
        >
          <span className="text-lg">←</span> RETURN TO DATABASE
        </Link>
      </div>
      
      <SystemWindow 
        title={`ITEM SPECIFICATION: ${product.title}`}
        headerAction={
          <div className="flex items-center space-x-2 bg-black/50 border border-system-border px-3 py-1 rounded-sm shadow-system-glow">
            <span className="text-xs font-orbitron text-system-muted tracking-widest uppercase">Current Funds:</span>
            <FundsDisplay />
          </div>
        }
      >
        <ProductDetailClient product={product} />
      </SystemWindow>
    </div>
  );
}
