/* eslint-disable */ 
import api from '@/services/axiosInstance'; // Adjust the import based on your file structure
import { parseCookies } from 'nookies';

// Define the Role interface
interface Permission {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  pivot: {
    role_id: number;
    permission_id: number;
  };
}

interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

interface PaginatedData<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
  per_page: number;
}

interface RolesResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: PaginatedData<Role>;
  first_page_url: string;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

// Function to fetch roles and permissions with pagination and optional search query
export const fetchRolesPermissions = async (page: number, query: string = '', per_page: number = 5): Promise<RolesResponse> => {
  const cookies = parseCookies(); // This retrieves all cookies as an object
  const token = cookies.token; // Access the token cookie directly

  if (!token) {
    throw new Error('Silahkan Login');
  }

  try {
    const response = await api.get<RolesResponse>(
      `${process.env.NEXT_PUBLIC_ROLE_API}?page=${page}${query ? `&query=${query}` : ''}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the header
        },
      }
    );

    return response.data; // Return the paginated response
  } catch (error: any) {
    console.error('Error fetching roles and permissions:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      throw new Error(`Failed to fetch roles and permissions: ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request data:', error.request);
      throw new Error('Failed to fetch roles and permissions: No response from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new Error(`Failed to fetch roles and permissions: ${error.message}`);
    }
  }
};

// New function to update role permissions
export const updateRolePermissions = async (roleId: number, permissions: number[]): Promise<any> => {
  const cookies = parseCookies(); // This retrieves all cookies as an object
  const token = cookies.token; // Access the token cookie directly

  if (!token) {
    throw new Error('Silahkan Login');
  }

  try {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_ROLE_API}/${roleId}/permissions`,
      {
        permissions, // The array of permissions
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the header
        },
      }
    );

    return response.data; // Return the response data
  } catch (error: any) {
    console.error('Error updating role permissions:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      throw new Error(`Failed to update role permissions: ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request data:', error.request);
      throw new Error('Failed to update role permissions: No response from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new Error(`Failed to update role permissions: ${error.message}`);
    }
  }
};
