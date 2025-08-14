'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  sidebarWidth: string;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState('0px');

  useEffect(() => {
    const handleResize = () => {
      const lgBreakpoint = 1024;
      const mdBreakpoint = 768;
      const newIsOpen = window.innerWidth >= lgBreakpoint;
      setIsSidebarOpen(newIsOpen);

      if (newIsOpen) {
        if (window.innerWidth >= lgBreakpoint) {
          setSidebarWidth('6rem'); // 96px for lg:w-24
        } else if (window.innerWidth >= mdBreakpoint) {
          setSidebarWidth('5rem'); // 80px for md:w-20
        } else {
          setSidebarWidth('4rem'); // 64px for w-16
        }
      } else {
        setSidebarWidth('0px');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  useEffect(() => {
    const lgBreakpoint = 1024;
    const mdBreakpoint = 768;
    if (isSidebarOpen) {
      if (window.innerWidth >= lgBreakpoint) {
        setSidebarWidth('6rem'); // 96px
      } else if (window.innerWidth >= mdBreakpoint) {
        setSidebarWidth('5rem'); // 80px
      } else {
        setSidebarWidth('4rem'); // 64px
      }
    } else {
      setSidebarWidth('0px');
    }
  }, [isSidebarOpen]);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, sidebarWidth }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
