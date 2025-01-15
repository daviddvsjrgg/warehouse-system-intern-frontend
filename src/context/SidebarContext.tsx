"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context type
interface SidebarContextType {
  openUserManagementDropdown: string | null;
  openScanDropdown: string | null;
  toggleUserManagementDropdown: (dropdown: string) => void;
  toggleScanDropdown: (dropdown: string) => void;
}

// Default values for the context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// SidebarProvider component with children prop typed
interface SidebarProviderProps {
  children: ReactNode;  // Accepts children as ReactNode
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [openUserManagementDropdown, setOpenUserManagementDropdown] = useState<string | null>(null);
  const [openScanDropdown, setOpenScanDropdown] = useState<string | null>(null);

  // Toggle logic for dropdowns
  const toggleUserManagementDropdown = (dropdown: string) => {
    setOpenUserManagementDropdown(prevState => (prevState === dropdown ? null : dropdown));
  };

  const toggleScanDropdown = (dropdown: string) => {
    setOpenScanDropdown(prevState => (prevState === dropdown ? null : dropdown));
  };

  return (
    <SidebarContext.Provider
      value={{
        openUserManagementDropdown,
        openScanDropdown,
        toggleUserManagementDropdown,
        toggleScanDropdown,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook to use the SidebarContext
export const useSidebarContext = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};
