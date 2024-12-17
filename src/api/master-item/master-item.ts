import api from '@/services/axiosInstance'; // Adjust the import based on your file structure
import { parseCookies } from 'nookies';

// Exporting Item interface for reuse
export interface Item {
  id: number;
  barcode_sn: string;
  nama_barang: string;
  sku: string;
  invoiceNumber: string;
  qty: number;
  created_at: string;
  updated_at: string;
}

// Generic interface for paginated data
export interface PaginatedData<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
  per_page: number;
}

// Exporting PaginatedResponse interface
export interface PaginatedResponse {
  success: boolean;
  message: string;
  data: PaginatedData<Item>; // Use the PaginatedData type for the data field
}

// Define the Item Batch
interface ItemBatch {
  sku: string;
  nama_barang: string;
  barcode_sn: string;
}

// ItemDetails interface for individual item representation
export interface ItemDetails {
  id: number; // Unique identifier for the item
  barcode_sn: string; // Barcode serial number
  nama_barang: string; // Name of the item
  sku: string; // Stock Keeping Unit
  created_at: string; // Creation timestamp
  updated_at: string; // Last updated timestamp
}

// ApiResponse interface for the overall API response structure
export interface ApiResponse {
  status_code: number; // HTTP status code
  success: boolean; // Indicates whether the request was successful
  message: string; // Response message from the API
  data: ItemDetails[]; // Array of items returned from the API
}

// Function to fetch master items with pagination and optional search query
export const fetchMasterItems = async (page: number, query: string = '', per_page: number): Promise<PaginatedResponse> => {
  const cookies = parseCookies(); // This retrieves all cookies as an object
  const token = cookies.token; // Access the token cookie directly

  if (!token) {
    throw new Error('No token found');
  }

  // Construct the URL with pagination and search query
  const response = await api.get<PaginatedResponse>(
    `${process.env.NEXT_PUBLIC_MASTER_ITEM_API}?page=${page}${query ? `&query=${query}` : ''}&per_page=${per_page}`,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in the header
      },
    }
  );

  return response.data; // Return the paginated response
};


// Function to add a new item (CREATE)
export const addMasterItems = async (items: { sku: string; nama_barang: string; barcode_sn: string }[]): Promise<ItemBatch[]> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('No token found');
  }

  // Check for duplicate SKUs within the provided items
  const skuSet = new Set<string>();
  for (const item of items) {
    if (skuSet.has(item.sku)) {
      throw new Error(`Duplicate SKU found: ${item.sku}`);
    }
    skuSet.add(item.sku);
  }

  try {
    const response = await api.post<Item[]>(
      `${process.env.NEXT_PUBLIC_MASTER_ITEM_API}`,
      { items }, // Wrap items in an object to match the API expected format
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // Returns an array of inserted items
  } catch (error: any) {
    console.error('Error adding master items:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      throw new Error(`Failed to add master items: ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request data:', error.request);
      throw new Error('Failed to add master items: No response from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new Error(`Failed to add master items: ${error.message}`);
    }
  }
};
// Function to update an existing item (UPDATE)
export const updateMasterItem = async (id: number, sku: string, nama_barang: string, barcode_sn: string): Promise<Item> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('No token found');
  }

  const response = await api.put<Item>(
    `${process.env.NEXT_PUBLIC_MASTER_ITEM_API}/${id}`,
    { sku, nama_barang, barcode_sn, _method: 'PUT' }, // Method override for backward compatibility
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Function to delete an item (DELETE)
export const deleteMasterItem = async (id: number): Promise<{ success: boolean; message: string }> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('No token found');
  }
  
  const response = await api.delete<{ success: boolean; message: string }>(
    `${process.env.NEXT_PUBLIC_MASTER_ITEM_API}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
