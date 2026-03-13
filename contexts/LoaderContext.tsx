"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface LoaderContextType {
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const setIsLoading = useCallback((loading: boolean) => {
    setLoadingCount(prev => loading ? prev + 1 : Math.max(0, prev - 1));
  }, []);

  const isLoading = loadingCount > 0;

  return (
    <LoaderContext.Provider value={{ setIsLoading, isLoading }}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
}
