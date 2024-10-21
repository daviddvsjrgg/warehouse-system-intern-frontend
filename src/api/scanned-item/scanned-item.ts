import api from '@/services/axiosInstance';
import { getUserIdFromToken } from '@/api/auth/auth';
import { parseCookies } from 'nookies';

interface ScannedItem {
  item_id: number; // Assuming item_id is a number
  sku: string;
  invoice_number: string;
  qty: number;
  user_id: number; // Assuming user_id is also a number
}

// interfaces/scannedItem.ts

export interface FetchScannedItem {
  id: number;
  sku: string;
  invoice_number: string;
  qty: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  master_item: {
    id: number;
    barcode_sn: string;
    nama_barang: string;
    sku: string;
    created_at: string;
    updated_at: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ApiResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: FetchScannedItem[];
    total: number;
    per_page: number;
    last_page: number;
    next_page_url: string | null;
  };
}

// Function to fetch scanned items with optional pagination
export const fetchScannedItems = async (page: number = 1): Promise<FetchScannedItem[]> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('No token found');
  }
  
  try {
    // Send GET request to fetch scanned items with optional pagination
    const response = await api.get<ApiResponse>(
      `${process.env.NEXT_PUBLIC_SCAN_SN_API}?per_page=100`, // Querying with page number
      {
        headers: {
          Authorization: `Bearer ${token}`, // Authorization header
        },
      }
    );

    // Return the scanned items data from the API response
    return response.data.data.data; // Accessing the data array inside the response
  } catch (error: any) {
    console.error('Error details:', error.response?.data);
    const errorMessage = error.response?.data?.message || 'Error fetching scanned items';
    throw new Error(errorMessage);
  }
};

// Function to submit scanned items
export const addScannedItems = async (items: { id: number; sku: string; invoiceNumber: string; qty: number }[]): Promise<any[]> => {
  const cookies = parseCookies();
  const token = cookies.token; // Get token from cookies

  if (!token) {
    throw new Error('No token found');
  }

  // Extract user ID from cookies or an API call
  const userId = await getUserIdFromToken(token); // Assume this function fetches user ID from token

  // Prepare the payload with the correct structure
  const payload = {
    items: items.map(item => ({
      item_id: item.id,               // Use item.id
      sku: item.sku,                  // Use item.sku
      invoice_number: item.invoiceNumber, // Use item.invoiceNumber
      qty: item.qty,                  // Use item.qty
      user_id: userId,                // Use the fetched userId
    })),
  };

  try {
    // Send POST request with Authorization header
    const response = await api.post<ScannedItem[]>(
      `${process.env.NEXT_PUBLIC_SCAN_SN_API}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // Returns an array of inserted items or confirmation
  } catch (error: any) {
    console.error('Error details:', error.response?.data); // Log the server's response for debugging
    const errorMessage = error.response?.data?.message || 'Error submitting scanned items';
    throw new Error(errorMessage);
  }
};
