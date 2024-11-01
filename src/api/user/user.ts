import { parseCookies } from 'nookies';
import api from '@/services/axiosInstance';
import { User } from '@/utils/interface/userInterface';

export const getUser = async (): Promise<User | null> => {
  try {
    // Set the token in the Authorization header if it exists
    const cookies = parseCookies(); // This retrieves all cookies as an object
    const token = cookies.token; // Access the token cookie directly

    const response = await api.get(`${process.env.NEXT_PUBLIC_USER_API}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Send the token as a bearer token
      },
    });
    return response.data; // Assume user data is returned in the response

  } catch (error) {
    console.error('Error fetching user:', error);
    return null; // Return null in case of an error
  }
};
