// components/LayoutContext.tsx - FINAL, ENHANCED VERSION

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface LayoutContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Set initial state to FALSE (Light Mode Default)
  const [isDarkMode, setIsDarkMode] = useState(false); 

  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // 🚨 CRITICAL FIX: Ensures the class is applied immediately on client load and on state change 🚨
  useEffect(() => {
    // We only execute this logic in the browser environment
    if (typeof document === 'undefined') {
        return;
    }
    
    const htmlElement = document.documentElement;
    
    // Step 1: Initialize the class based on current state
    if (isDarkMode) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }
    
    // Optional: Log state change to the console for absolute confirmation
    console.log(`Theme toggled. Dark mode is now: ${isDarkMode}`);

  }, [isDarkMode]); // Dependency array ensures it runs on state change

  const value = { 
    isExpanded, 
    toggleSidebar,
    isDarkMode, 
    toggleDarkMode 
  };

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