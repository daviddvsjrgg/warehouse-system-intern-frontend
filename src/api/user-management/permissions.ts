/* eslint-disable */
import api from '@/services/axiosInstance';
import { parseCookies } from 'nookies';

// Define the Permission interface
interface Permission {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface PermissionsResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: Permission[];
}

interface AddPermissionRequest {
  name: string;
  description: string | null;
}

// Function to fetch permissions with pagination and optional search query
export const fetchPermissions = async (page: number, query: string = '', per_page: number = 5): Promise<PermissionsResponse> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('Silahkan Login');
  }

  try {
    const response = await api.get<PermissionsResponse>(
      `${process.env.NEXT_PUBLIC_PERMISSION_API}?page=${page}${query ? `&query=${query}` : ''}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching permissions:', error);
    throw new Error(`Failed to fetch permissions: ${error.message}`);
  }
};

// Function to add a new permission
export const addPermission = async (permissionData: AddPermissionRequest): Promise<PermissionsResponse> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('Silahkan Login');
  }

  try {
    const response = await api.post<PermissionsResponse>(
      `${process.env.NEXT_PUBLIC_PERMISSION_API}`,
      permissionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error adding permission:', error);
    throw new Error(`Failed to add permission: ${error.message}`);
  }
};

// Function to update an existing permission
export const updatePermission = async (id: number, permissionData: AddPermissionRequest): Promise<PermissionsResponse> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('Silahkan Login');
  }

  try {
    const response = await api.put<PermissionsResponse>(
      `${process.env.NEXT_PUBLIC_PERMISSION_API}/${id}`,
      { ...permissionData, _method: 'PUT' }, // Adding _method to indicate PUT
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error updating permission:', error);
    throw new Error(`Failed to update permission: ${error.message}`);
  }
};

// Function to delete a permission
export const deletePermission = async (id: number): Promise<PermissionsResponse> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('Silahkan Login');
  }

  try {
    const response = await api.delete<PermissionsResponse>(
      `${process.env.NEXT_PUBLIC_PERMISSION_API}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error deleting permission:', error);
    throw new Error(`Failed to delete permission: ${error.message}`);
  }
};
