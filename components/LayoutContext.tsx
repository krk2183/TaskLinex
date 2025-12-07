// components/LayoutContext.tsx

"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded

  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };

  const value = { isExpanded, toggleSidebar };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}