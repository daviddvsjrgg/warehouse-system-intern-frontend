import api from '@/services/axiosInstance';
import { getUserIdFromToken } from '@/api/auth/auth';
import { parseCookies } from 'nookies';

interface ScannedItem {
  item_id: number;
  sku: string;
  invoice_number: string;
  qty: number;
  user_id: number; 
  barcode_sn: string;
}

// interfaces/scannedItem.ts

export interface FetchScannedItem {
  id: number;
  sku: string;
  invoice_number: string;
  qty: number;
  barcode_sn: string;
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

export const fetchScannedItems = async (
  page: number = 1,
  perPage: number = 5,
  exactSearch: string = '',
  startDate?: string,
  endDate?: string,
  checkDuplicate?: boolean,
  isExactSearch?: boolean,
  selectedFilter?: string,
): Promise<FetchScannedItem[]> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('No token found');
  }

  try {
    const queryParams: string[] = [];
    queryParams.push(`per_page=${perPage}`);
    queryParams.push(`page=${page}`);
    queryParams.push(`check-duplicate=${checkDuplicate}`);
    queryParams.push(`is_exact_search=${isExactSearch}`); // Use the isExactSearch flag

    if (exactSearch) {
      queryParams.push(`exact=${encodeURIComponent(exactSearch)}`);
    }

    if (selectedFilter) {
      // Convert selectedFilter to appropriate query parameters
      if (selectedFilter === 'Semua') {
        queryParams.push('selected_filter='); // Empty for backend to search all fields
      } else {
        queryParams.push(
          `selected_filter=${encodeURIComponent(selectedFilter.toLowerCase())}`
        );
      }
    }

    if (startDate) {
      queryParams.push(`start_date=${encodeURIComponent(startDate)}`);
    }
    if (endDate) {
      queryParams.push(`end_date=${encodeURIComponent(endDate)}`);
    }

    const response = await api.get<ApiResponse>(
      `${process.env.NEXT_PUBLIC_SCAN_SN_API}?${queryParams.join('&')}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch scanned items');
    }

    return response.data.data.data;
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown Error';
    throw new Error(errorMessage);
  }
};

export const fetchScannedItemsBatch = async (
  invoiceNumbers: string[],
  barcodeSNs: string[],
  startDate?: string,
  endDate?: string
): Promise<FetchScannedItem[]> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('No token found');
  }

  try {
    // Prepare query parameters
    const queryParams = new URLSearchParams();
    invoiceNumbers.forEach(invoiceNumber =>
      queryParams.append('invoice_numbers[]', invoiceNumber)
    );
    barcodeSNs.forEach(barcodeSN =>
      queryParams.append('barcode_sns[]', barcodeSN)
    );
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);

    const response = await api.get<ApiResponse>(
      `${process.env.NEXT_PUBLIC_SCAN_SN_API}?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch scanned items');
    }

    return response.data.data.data;
  } catch (error) {
    throw new Error((error as Error).message || "Unknown Error");
  }
};


export const getTotalItemScannedItems = async (
  page: number = 1,
  perPage: number = 5,
  exactSearch: string = '',
  startDate?: string,
  endDate?: string,
  checkDuplicate?: boolean,
  isExactSearch?: boolean,
  selectedFilter?: string,
) => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('No token found');
  }

  try {
    const queryParams: string[] = [];
    queryParams.push(`per_page=${perPage}`);
    queryParams.push(`page=${page}`);
    queryParams.push(`check-duplicate=${checkDuplicate}`);
    queryParams.push(`is_exact_search=${isExactSearch}`); // Use the isExactSearch flag

    if (exactSearch) {
      queryParams.push(`exact=${encodeURIComponent(exactSearch)}`);
    }

    if (selectedFilter) {
      // Convert selectedFilter to appropriate query parameters
      if (selectedFilter === 'Semua') {
        queryParams.push('selected_filter='); // Empty for backend to search all fields
      } else {
        queryParams.push(
          `selected_filter=${encodeURIComponent(selectedFilter.toLowerCase())}`
        );
      }
    }

    if (startDate) {
      queryParams.push(`start_date=${encodeURIComponent(startDate)}`);
    }
    if (endDate) {
      queryParams.push(`end_date=${encodeURIComponent(endDate)}`);
    }

    const response = await api.get<ApiResponse>(
      `${process.env.NEXT_PUBLIC_SCAN_SN_API}?${queryParams.join('&')}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch scanned items');
    }

    // Return the scanned items data from the API response
    return response.data.data; // Accessing the data array inside the response
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown Error';
    throw new Error(errorMessage);
  }
};

// Function to submit scanned items
export const addScannedItems = async (items: { id: number; sku: string; invoiceNumber: string; qty: number; barcode_sn: string; }[]): Promise<ScannedItem[]> => {
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
      item_id: item.id,
      sku: item.sku,
      invoice_number: item.invoiceNumber,
      qty: item.qty,
      user_id: userId,   
      barcode_sn: item.barcode_sn
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
  } catch (error) {
    const errorMessage = (error as Error).message || "Unknown Error";
    throw new Error(errorMessage);
  }
};

// Function to update an existing item (UPDATE)
export const updateScannedItemSN = async (id: number, qty: number, barcode_sn: string): Promise<ScannedItem> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('No token found');
  }

  const response = await api.put<ScannedItem>(
    `${process.env.NEXT_PUBLIC_SCAN_SN_API}/update-sn/${id}`,
    { qty, barcode_sn, _method: 'PUT' },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const updateScannedItemInvoice = async (id: number, invoice_number: string): Promise<ScannedItem> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('No token found');
  }

  const response = await api.put<ScannedItem>(
    `${process.env.NEXT_PUBLIC_SCAN_SN_API}/update-invoice/${id}`,
    { invoice_number, _method: 'PUT' },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const updateScannedItemAllInvoice = async (editInvoice: string, editTempInvoice: string): Promise<ScannedItem> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('No token found');
  }

  const response = await api.put<ScannedItem>(
    `${process.env.NEXT_PUBLIC_SCAN_SN_API}/update-all-invoice`,
    {editInvoice, editTempInvoice, _method: 'PUT' },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Function to delete an item (DELETE)
export const deleteScannedItem = async (id: number): Promise<{ success: boolean; message: string }> => {
  const cookies = parseCookies();
  const token = cookies.token;

  if (!token) {
    throw new Error('No token found');
  }
  
  const response = await api.delete<{ success: boolean; message: string }>(
    `${process.env.NEXT_PUBLIC_SCAN_SN_API}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};