"use client";

import { useState, useCallback, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import SystemWindow from "@/components/SystemWindow";

// Simple CSV parser
function parseCSV(text: string) {
  const lines = text.split("\n").filter(line => line.trim() !== "");
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(",");
    const obj: any = {};
    headers.forEach((header, i) => {
      let val: any = values[i]?.trim();
      if (header === "Price" || header === "Stock") {
        val = parseInt(val) || 0;
      }
      obj[header.toLowerCase()] = val;
    });
    return obj;
  });
}

// Client-side image compression
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        }, "image/jpeg", 0.7); // 70% quality
      };
    };
  });
}

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("System Idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startSeeding = async () => {
    setLoading(true);
    setStatus("Accessing System Registry...");
    try {
      const csvResponse = await fetch("/items_sourcing.csv");
      if (!csvResponse.ok) throw new Error("Registry access denied");
      const csvText = await csvResponse.text();
      const items = parseCSV(csvText);
      setProducts(items);
      setCurrentIndex(0);
      setStatus("Registry Synchronized. Awaiting User Asset [1/50]");
    } catch (error: any) {
      setStatus(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus(`Asset Cached: ${file.name}. Ready for injection.`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus(`Asset Cached: ${file.name}. Ready for injection.`);
    }
  };

  const processCurrentItem = async () => {
    if (!selectedFile || currentIndex === -1) return;
    
    setLoading(true);
    const product = products[currentIndex];
    setUploadProgress(10); // Start progress

    try {
      setStatus(`Compressing asset for ${product.title}...`);
      const compressedFile = await compressImage(selectedFile);
      setUploadProgress(30);
      
      setStatus(`Uploading: ${product.title} to Supabase...`);
      const fileName = `item_${currentIndex.toString().padStart(3, '0')}_${Date.now()}.jpg`;
      
      // Upload to Supabase 'products' bucket
      const { data, error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      setUploadProgress(70);

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      setStatus(`Etching metadata for ${product.title}...`);
      
      const productRef = doc(db, "products", `item_${currentIndex.toString().padStart(3, '0')}`);
      await setDoc(productRef, {
        id: productRef.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        imageUrl: publicUrl,
        rarity: product.rarity || 'common',
        createdAt: Date.now()
      });

      setUploadProgress(100);
      setSelectedFile(null);
      setPreviewUrl(null);
      
      setTimeout(() => {
        setUploadProgress(0);
        if (currentIndex + 1 < products.length) {
          setCurrentIndex(prev => prev + 1);
          setStatus(`Item ${currentIndex + 1} finalized. Awaiting User Asset [${currentIndex + 2}/${products.length}]`);
        } else {
          setCurrentIndex(-1);
          setStatus("SUCCESS: Registry complete using Supabase Storage.");
        }
        setLoading(false);
      }, 500);

    } catch (error: any) {
      setStatus(`ERROR: ${error.message}`);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const recalibrateRegistry = async () => {
    setLoading(true);
    setStatus("Initiating Global Registry Recalibration...");
    try {
      const csvResponse = await fetch("/items_sourcing.csv");
      const csvText = await csvResponse.text();
      const items = parseCSV(csvText);
      
      let count = 0;
      for (let i = 0; i < items.length; i++) {
        const product = items[i];
        const productRef = doc(db, "products", `item_${i.toString().padStart(3, '0')}`);
        setStatus(`Recalibrating Grade: ${product.title}...`);
        
        await setDoc(productRef, {
          rarity: product.rarity || 'common'
        }, { merge: true });
        
        count++;
        setUploadProgress((count / items.length) * 100);
      }
      
      setStatus(`SUCCESS: ${count} entities recalibrated in the registry.`);
    } catch (error: any) {
      setStatus(`RECALIBRATION ERROR: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (currentIndex === -1 && products.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 flex-grow w-full">
        <SystemWindow title="SYSTEM INITIALIZATION: SUPABASE ASSET PROTOCOL">
          <div className="p-6 space-y-6 text-center">
            <p className="text-system-muted font-rajdhani text-lg">
              Firebase Storage tier exceeded. Transitioning to Supabase.
              <br />
              <span className="text-system-accent">Initializing Supabase Manual Asset Protocol.</span>
            </p>
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={startSeeding}
                disabled={loading}
                className="w-full px-8 py-4 rounded-sm border border-system-accent bg-system-accent/20 
                           text-system-accent font-orbitron font-bold uppercase tracking-widest shadow-system-glow 
                           hover:bg-system-accent hover:text-black transition-all"
              >
                Initialize Full Registry
              </button>
              
              <button
                onClick={recalibrateRegistry}
                disabled={loading}
                className="w-full px-8 py-3 rounded-sm border border-amber-500/50 bg-amber-500/10 
                           text-amber-500 font-orbitron font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all"
              >
                Recalibrate Registry Grades
              </button>
            </div>
            <p className="text-[10px] font-mono text-system-muted/50 uppercase text-center mt-4">
              STATUS: {status}
            </p>
          </div>
        </SystemWindow>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 flex-grow w-full">
      <SystemWindow title={`ASSET INJECTION PROTOCOL [${currentIndex + 1}/${products.length || 50}]`}>
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border-l-2 border-system-accent pl-3">
                <h2 className="text-xl font-orbitron text-system-accent uppercase">{currentProduct?.title}</h2>
                <p className="text-xs font-mono text-system-muted uppercase tracking-tighter">{currentProduct?.category}</p>
              </div>
              <p className="text-sm text-white/80 font-rajdhani leading-relaxed italic">
                "{currentProduct?.description}"
              </p>
            </div>

            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-sm aspect-square flex flex-col items-center justify-center cursor-pointer transition-all
                ${previewUrl ? 'border-system-accent/50 bg-system-accent/5' : 'border-system-border/30 hover:border-system-accent/50 hover:bg-white/5'}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" disabled={loading} />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center p-4">
                  <div className="text-3xl mb-2 text-system-accent">+</div>
                  <p className="text-[10px] font-mono text-system-muted uppercase tracking-widest">Drop Item Artifact</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-system-accent uppercase tracking-widest px-1">
              <span>System Link: {status}</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-black/50 border border-system-border/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-system-accent transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.5)]" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={processCurrentItem}
            disabled={loading || !selectedFile}
            className="w-full py-4 rounded-sm border border-system-accent bg-system-accent/20 
                       text-system-accent font-orbitron font-bold uppercase tracking-widest shadow-system-glow 
                       hover:bg-system-accent hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "ETCHING ASSET..." : "FINALIZE & PROCEED"}
          </button>
        </div>
      </SystemWindow>
    </div>
  );
}
