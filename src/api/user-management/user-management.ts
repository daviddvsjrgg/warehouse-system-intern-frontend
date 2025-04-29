import api from '@/services/axiosInstance'; // Adjust the import based on your file structure
import { parseCookies } from 'nookies';
// Exporting ItemDetails interface for each user
export interface Role {
  name: string; // Role name
  pivot: {
    user_id: number; // User ID associated with the role
    role_id: number; // Role ID associated with the user
  };
}

export interface ItemDetails {
  id: number; // Unique identifier for the item
  name: string; // Name of the user (e.g., user name)
  email: string; // Email address
  email_verified_at: string | null; // Email verification timestamp
  created_at: string; // Creation timestamp
  updated_at: string; // Last updated timestamp
  roles: Role[]; // List of roles associated with the user
}

// Generic interface for paginated data
export interface PaginatedData<T> {
  current_page: number;
  data: T[]; // A generic array of data, can be ItemDetails for users
  last_page: number;
  total: number;
  per_page: number;
  first_page_url?: string;
  last_page_url?: string;
  next_page_url?: string;
  prev_page_url?: string;
  links?: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

// Exporting PaginatedResponse interface for user-specific data
export interface PaginatedResponse {
  success: boolean;
  message: string;
  data: PaginatedData<ItemDetails>; // Paginated data of users (ItemDetails)
}

// ApiResponse interface for the overall API response structure
export interface ApiResponse {
  status_code: number; // HTTP status code
  success: boolean; // Indicates whether the request was successful
  message: string; // Response message from the API
  data: ItemDetails[]; // Array of users returned from the API
}

// Function to fetch master items with pagination and optional search query
export const fetchUsers = async (page: number, query: string = '', per_page: number): Promise<PaginatedResponse> => {
  const cookies = parseCookies(); // This retrieves all cookies as an object
  const token = cookies.token; // Access the token cookie directly

  if (!token) {
    throw new Error('Silahkan Login');
  }

  // Construct the URL with pagination and search query
  const response = await api.get<PaginatedResponse>(
    `${process.env.NEXT_PUBLIC_USER_MANAGEMENT_API}?page=${page}${query ? `&query=${query}` : ''}&per_page=${per_page}`,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in the header
      },
    }
  );

  return response.data; // Return the paginated response
};

// Function to update user roles via API
export const updateRoles = async (userId: number, name: string, roles: string[]): Promise<ApiResponse> => {
  const cookies = parseCookies(); // Get cookies
  const token = cookies.token; // Extract the token

  if (!token) {
    throw new Error('Silahkan Login');
  }

  // Construct the payload
  const payload = {
    id: userId,
    name,
    roles,
    _method: 'PUT', // Specify method required by backend
  };

  console.log('Payload being sent:', payload); // Log the payload
  console.log('UserId:', userId); // Log userId

  // Make the API call
  const response = await api.put<ApiResponse>(
    `${process.env.NEXT_PUBLIC_USER_MANAGEMENT_API}/${userId}`, // Adjust endpoint if necessary
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
        'Content-Type': 'application/json', // Set content type
      },
    }
  );

  console.log('Response from API:', response.data); // Log the API response
  return response.data; // Return API response
};

export const addUser = async (userData: {
  name: string;
  email: string;
  password: string;
  roles: string[];
}): Promise<ApiResponse> => {
  // Validate required fields
  if (!userData.name || !userData.email || !userData.password || userData.roles.length === 0) {
    throw new Error('All fields are required. Please ensure name, email, password, and roles are filled.');
  }

  const cookies = parseCookies(); // Get cookies
  const token = cookies.token; // Extract the token

  if (!token) {
    throw new Error('Silahkan Login'); // Token validation
  }

  // Construct the payload for creating a user
  const payload = {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    roles: userData.roles,
  };

  console.log('Payload being sent:', payload); // Log the payload for debugging

  try {
    // Make the API call to create the user
    const response = await api.post<ApiResponse>(
      `${process.env.NEXT_PUBLIC_USER_MANAGEMENT_API}`, // Adjust the endpoint if necessary
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the header
          'Content-Type': 'application/json', // Set content type
        },
      }
    );

    // Log the API response for debugging
    console.log('Response from API:', response.data);

    // Validate the response structure if necessary (check if it has the expected fields)
    if (!response.data || !response.data.success) {
      throw new Error('User creation failed. Invalid response from the API.');
    }

    // Return the API response if successful
    return response.data; 

  } catch (error: unknown) {
    // Type narrowing to ensure error is an instance of Error
    if (error instanceof Error) {
      console.error('Error occurred while creating user:', error.message);
      throw new Error(`Failed to create user: ${error.message}`);
    } else {
      // Handle the case where error is not an instance of Error
      console.error('An unknown error occurred:', error);
      throw new Error('Failed to create user: Unknown error');
    }
  }
};
