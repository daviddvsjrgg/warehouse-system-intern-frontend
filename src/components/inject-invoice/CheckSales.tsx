/* eslint-disable */ 
import React, { useState, useEffect } from 'react';
import useDebounce from '@/hooks/useDebounce';
import fetchInvoiceByNumber from '@/api/invoice/invoice';
import * as xml2js from 'xml2js';

// Helper function to determine status based on Total Pesanan and Total Quantity
const getStatus = (totalPesanan: number, totalQuantity: number) => {
  return totalPesanan === totalQuantity ? 'Valid' : 'Warning';
};

const CheckSales: React.FC = () => {
  const [inputInvoiceValue, setInputInvoiceValue] = useState<string>(''); // For the input field
  const [invoiceData, setInvoiceData] = useState<any | null>(null); // For storing invoice data
  const [errorMessage, setErrorMessage] = useState<string>(''); // For error/success message
  const [loading, setLoading] = useState<boolean>(false); // For loading state
  const [xmlFile, setXmlFile] = useState<File | null>(null); // For the XML file input

  const debouncedValue = useDebounce<string>(inputInvoiceValue, 500); // Debounce input value

  // Function to parse XML and extract invoice number
  const parseXML = async (xml: string) => {
    try {
      const result = await xml2js.parseStringPromise(xml);
      const invoiceNumber = result.NMEXML?.TRANSACTIONS?.[0]?.SALESINVOICE?.[0]?.INVOICENO?.[0];
      if (invoiceNumber) {
        setInputInvoiceValue(invoiceNumber);
      } else {
        setErrorMessage('Invoice number not found in the XML.');
      }
    } catch (error) {
      setErrorMessage('Error parsing XML: ' + error);
      console.error('Error parsing XML:', error);
    }
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/xml' || file.name.endsWith('.xml')) {
        setXmlFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const xmlContent = e.target?.result as string;
          parseXML(xmlContent);
        };
        reader.onerror = (err) => {
          setErrorMessage('Error reading file: ' + err);
          console.error('Error reading file:', err);
        };
        reader.readAsText(file);
      } else {
        setErrorMessage('Please upload a valid XML file.');
      }
    }
  };

  // Effect to fetch data when the debounced value changes
  useEffect(() => {
    const fetchInvoice = async () => {
      if (debouncedValue.trim()) {
        setLoading(true);
        setErrorMessage('');
        setInvoiceData(null);

        try {
          const response = await fetchInvoiceByNumber(debouncedValue); // Await the API call
          const invoiceList = response?.data?.data || []; // Default to empty array if undefined

          if (invoiceList.length > 0) {
            setInvoiceData(invoiceList[0]); // Use the first invoice
            setErrorMessage('Invoice ditemukan.');
          } else {
            setErrorMessage('Invoice tidak ditemukan.');
            setInvoiceData(null); // Explicitly set null if no invoice found
          }
        } catch (error) {
          setErrorMessage('Error fetching invoice.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setInvoiceData(null);
        setErrorMessage('');
      }
    };

    fetchInvoice(); // Call the async function
  }, [debouncedValue]);

  // Automatically clear error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000); // 3 seconds delay
      return () => clearTimeout(timer); // Clean up the timeout on component unmount or when error changes
    }
  }, [errorMessage]);

  return (
    <div className="p-4">
      <div className="flex">
        <h1 className="text-2xl font-bold mb-4">Invoice</h1>
        {errorMessage && !loading && (
          <p
            className={`mx-2 mt-1.5 ${
              errorMessage === 'Invoice ditemukan.'
                ? 'text-green-500'
                : 'text-red-500'
            }`}
          >
            {errorMessage}
          </p>
        )}
      </div>

      {/* XML File Input */}
      <div className="mb-4">
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full"
        />
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Invoice Number"
          value={inputInvoiceValue}
          onChange={(e) => setInputInvoiceValue(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full dark:table-dark">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nama Barang</th>
              <th>Total Pesanan</th>
              <th>Total Quantity</th>
              <th>Status</th>
              <th>SN</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center">
                  <span className="loading loading-dots loading-sm"></span>
                </td>
              </tr>
            )}

            {/* Show "Silahkan masukkan invoice" if no invoice data */}
            {!loading && invoiceData === null && errorMessage !== 'Invoice ditemukan.' && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500">
                  Belum ada catatan.
                </td>
              </tr>
            )}

            {/* Display invoice items */}
            {invoiceData && invoiceData.items.length > 0 && (
              <>
                {invoiceData.items.map((item: any) => {
                  // Calculate Total Pesanan (currently hardcoded as 0 for now)
                  const totalPesanan = 0; // Replace this with actual user input when the feature is implemented
                  const status = getStatus(totalPesanan, item.total_qty); // Call the getStatus function

                  return (
                    <tr key={item.sku} className="hover:bg-gray-200 dark:hover:bg-gray-600">
                      <td>{item.sku}</td>
                      <td>{item.item_name}</td>
                      <td>{totalPesanan}</td> {/* Default Total Pesanan as 0 */}
                      <td>{item.total_qty}</td> {/* Total Quantity */}
                      <td>
                        <span
                          className={`badge ${
                            status === 'Valid' ? 'badge-success text-white' : 'badge-warning'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        {item.serial_numbers.map((sn: any, index: number) => (
                          <span key={index} className="badge badge-primary mx-1 mt-1">
                            {sn.barcode_sn}
                          </span>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckSales;
