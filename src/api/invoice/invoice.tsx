import api from '@/services/axiosInstance';
import { parseCookies } from 'nookies';

// Define types for serial numbers, items, and invoice
type SerialNumber = {
    barcode_sn: string;
  };
  
  type Item = {
    sku: string;
    item_name: string;
    total_qty: number;
    serial_numbers: SerialNumber[];
  };
  
  type Invoice = {
    invoice_number: string;
    total_qty: number;
    items: Item[];
    user_email: string;
    created_at: string;
    updated_at: string;
  };
  
  // Define the structure for API pagination data
  type PaginationData = {
    current_page: number;
    data: Invoice[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  
  // Define the full API response type
  type ApiResponse = {
    status_code: number;
    success: boolean;
    message: string;
    data: PaginationData;
  };
  

  const fetchInvoiceByNumber = async (invoiceNumber: string): Promise<ApiResponse | null> => {
    try {
      // Retrieve the token from cookies
      const cookies = parseCookies(); 
      const token = cookies.token; // Access the token cookie directly
  
      // If no token is found, throw an error
      if (!token) {
        throw new Error('No token found');
      }
  
      // Send the request with the token in the Authorization header
      const response = await api.get<ApiResponse>(`${process.env.NEXT_PUBLIC_INVOICE_API}`, {
        params: { invoice_number: invoiceNumber },
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the header
        },
      });
  
      if (response.data.success) {
        console.log('Invoice data:', response.data.data);
        return response.data;
      } else {
        console.error('Failed to fetch invoice:', response.data.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  };
  
  export default fetchInvoiceByNumber;
