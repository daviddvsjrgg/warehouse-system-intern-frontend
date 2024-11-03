"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUser } from '@/api/user/user'; // Adjust the import path as needed
import { User } from '@/utils/interface/userInterface'; // Adjust the import path as needed

interface UserContextType {
  user: User | null;
  loading: boolean;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    setLoading(true);
    const userData = await getUser();
    setUser(userData);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetchUser = async () => {
    await fetchUser();
  };

  return (
    <UserContext.Provider value={{ user, loading, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
