"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { analyzeAesthetic, AestheticAnalysis } from '@/services/visionService';
import { searchByAesthetic } from '@/services/products';
import { Product } from '@/types';
import ProductCard from './ProductCard';

export default function AestheticSearch() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AestheticAnalysis | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setAnalysis(null);
      setResults([]);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const analysisData = await analyzeAesthetic(image);
      if (analysisData) {
        setAnalysis(analysisData);
        const matchedProducts = await searchByAesthetic(analysisData);
        setResults(matchedProducts);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative aspect-square rounded-sm border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center bg-black/40 group ${
              image ? 'border-system-accent border-solid' : 
              isDragging ? 'border-system-accent bg-system-accent/5 ring-4 ring-system-accent/20' : 
              'border-system-border/50 hover:border-system-accent'
            }`}
          >
            {image ? (
              <>
                <Image src={image} alt="Inspiration" fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
                  <span className="text-system-accent font-orbitron text-[10px] tracking-widest uppercase">Change Inspiration</span>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 border border-system-accent/30 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-system-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-system-text font-orbitron text-sm tracking-widest uppercase font-black">Upload Inspiration</h3>
                  <p className="text-system-muted font-rajdhani text-xs tracking-wider mt-1 italic">Drag Pinterest images or screenshots here</p>
                </div>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!image || isAnalyzing}
            className={`w-full py-4 font-orbitron font-black text-sm tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3 overflow-hidden relative group ${
              !image || isAnalyzing ? 'opacity-30 cursor-not-allowed border border-white/5' : 'bg-system-accent text-black hover:bg-white hover:shadow-system-glow-hover'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Analyzing_Aesthetic...
              </>
            ) : (
              <>
                Manifest_Aesthetic
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Analysis Feedback Section */}
        <div className="space-y-8">
          {analysis ? (
             <div className="bg-black/40 border border-system-border p-8 rounded-sm animate-fade-in-up">
                <div className="space-y-6">
                  <div>
                    <span className="text-system-accent text-[10px] font-orbitron tracking-widest uppercase opacity-60">Detected_Style</span>
                    <h2 className="text-3xl font-orbitron font-black text-white tracking-widest uppercase mt-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{analysis.style}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <span className="text-system-accent text-[10px] font-orbitron tracking-widest uppercase opacity-60">Palette</span>
                      <div className="flex flex-wrap gap-2">
                        {analysis.colors.map(color => (
                          <div key={color} className="group relative">
                            <div 
                              className="w-10 h-10 border border-white/10 rounded-sm shadow-lg hover:scale-110 transition-transform cursor-help" 
                              style={{ backgroundColor: color }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <span className="text-system-accent text-[10px] font-orbitron tracking-widest uppercase opacity-60">Essence</span>
                      <div className="flex flex-wrap gap-2">
                        {analysis.materials.map(mat => (
                          <span key={mat} className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-orbitron text-system-text uppercase tracking-widest">{mat}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-system-border/30">
                    <span className="text-system-accent text-[10px] font-orbitron tracking-widest uppercase opacity-60">Visual_Search_Tags</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                        {analysis.keywords.map(word => (
                          <span key={word} className="text-system-muted font-rajdhani italic text-sm">#{word.toLowerCase()}</span>
                        ))}
                    </div>
                  </div>
                </div>
             </div>
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-system-border/30 flex flex-col items-center justify-center p-12 text-center opacity-40">
              <svg className="w-16 h-16 text-system-muted mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h4 className="font-orbitron text-sm uppercase tracking-widest">Awaiting Input</h4>
              <p className="font-rajdhani text-xs mt-2 italic">Upload an image to extract its celestial aesthetic</p>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {(results.length > 0 || analysis) && (
        <div className="space-y-8 animate-fade-in delay-300 pt-8 border-t border-system-border/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-orbitron font-black text-white tracking-[0.2em] uppercase">Inspired_By_Your_Style</h2>
              <p className="text-system-accent font-rajdhani text-sm italic mt-1 tracking-wider opacity-60">Synchronizing matching artifacts from the registry...</p>
            </div>
            <div className="text-[10px] font-mono text-system-muted uppercase tracking-widest">
              {results.length} Artifacts Discovered
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            !isAnalyzing && (
              <div className="py-20 text-center border border-dashed border-system-border/30 rounded-sm">
                <span className="text-system-muted font-orbitron text-sm tracking-widest uppercase italic">No direct matches manifested. Try a different inspiration.</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
