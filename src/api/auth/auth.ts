// src/services/authService.ts
import api from '@/services/axiosInstance';
import { AxiosError } from 'axios';
import { destroyCookie, setCookie, parseCookies } from 'nookies';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
  status_code: number;
}

interface ErrorResponse {
  message: string;
}

// Function to log in the user
export const loginUser = async (credentials: LoginCredentials): Promise<string> => {
  try {
    const response = await api.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_LOGIN_API}`, 
      credentials
    );

    if (response.data.success) {
      const token = response.data.data.token;
      setCookie(null, 'token', token, {
        path: '/',
      });
      return token;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorMessage = axiosError.response?.data as ErrorResponse;
    throw new Error(errorMessage?.message || 'Email atau password salah!');
  }
};

// Function to log out the user
export const logoutUser = async (): Promise<void> => {
  try {
    // Get cookies using parseCookies
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
    
    localStorage.setItem('onUrl', "");
    console.log('User logged out successfully.');
    destroyCookie(null, 'token', { path: '/' }); // Remove the token cookie
  } catch (error) {
    console.error('Logout error:', error);
  }
};
