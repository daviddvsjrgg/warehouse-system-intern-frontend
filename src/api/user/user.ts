import { parseCookies } from 'nookies';
import api from '@/services/axiosInstance';
import { User } from '@/utils/interface/userInterface';

let cachedUser: User | null = null; // Cache variable to store the user data

export const getUser = async (): Promise<User | null> => {
  // Return cached user data if it exists
  if (cachedUser) {
    return cachedUser;
  }

  try {
    const cookies = parseCookies();
    const token = cookies.token;

    const response = await api.get(`${process.env.NEXT_PUBLIC_USER_API}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Cache the user data after successful fetch
    cachedUser = response.data; 
    return cachedUser; // Return the cached user data

  } catch (error) {
    console.error('Error fetching user:', error);
    return null; // Return null in case of an error
  }
};

// Clear cached data, e.g., on logout
export const clearUserCache = () => {
  cachedUser = null;
};
