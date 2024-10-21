import { parseCookies } from 'nookies';
import api from '@/services/axiosInstance';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
}

export const getUser = async (): Promise<User | null> => {
  try {
    // Set the token in the Authorization header if it exists
    const cookies = parseCookies(); // This retrieves all cookies as an object
    const token = cookies.token; // Access the token cookie directly

    if (token) {
      // Include the token in the Authorization header for the logout request
      await api.post(
        `${process.env.NEXT_PUBLIC_LOGOUT_API}`, 
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token as a bearer token
          },
        }
      );
    }

    // Make the API call to get user data
    const response = await api.get<User>(`${process.env.NEXT_PUBLIC_USER_API}`);
    return response.data; // Return the user data

  } catch (error) {
    console.error('Error fetching user:', error);
    return null; // Return null in case of an error
  }
};
