/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { fetchMasterItemBySku } from '@/api/master-item/master-item'; // Adjust this import based on your project structure
import { parseCookies } from 'nookies'; // To get token from cookies
import useDebounce from '@/hooks/useDebounce'; // Import the useDebounce hook
import { addScannedItems } from '@/api/scanned-item/scanned-item'; // Import the addScannedItems function from your service
import api from '@/services/axiosInstance'; // Import Axios Instance

const AddScanned = () => {
  const [sku, setSku] = useState(''); // State for SKU
  const [invoiceNumber, setInvoiceNumber] = useState(''); // State for Invoice Number
  const [barcodeSn, setBarcodeSn] = useState(''); // State for Barcode SN
  const [qty, setQty] = useState(1); // State for Quantity, default to 1
  const [items, setItems] = useState<any[]>([]); // State for the array of scanned items
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [loading, setLoading] = useState(false); // State for loading status
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for success messages

  const debouncedSku = useDebounce(sku, 500); // Debounce the SKU input with a 500ms delay

  // Fetch the user ID from the token
  const fetchUserId = async () => {
    const cookies = parseCookies();
    const token = cookies.token;

    if (!token) {
      setError('No token found');
      return;
    }

    try {
      await api.get(`${process.env.NEXT_PUBLIC_USER_API}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const errorMessage = (error as Error).message || "Unknwon error";
      setError('Failed to fetch user information.' + errorMessage);
    }
  };

  // Fetch user ID when the component mounts
  useEffect(() => {
    fetchUserId();
  }, []);

  // Function to fetch the item by SKU
  const handleSearchBySku = async (debouncedSku: string) => {
    setError(null); // Reset error state
    setLoading(true); // Set loading to true

    // Validate that invoice number is not empty
    if (!invoiceNumber) {
      setError('Invoice Number is required to search by SKU.');
      setLoading(false); // Set loading to false when done
      return; // Exit the function early if the invoice number is empty
    }

    try {
      if (debouncedSku) {
        const item = await fetchMasterItemBySku(debouncedSku); // Fetch the item by SKU
        setBarcodeSn(item.barcode_sn); // Set the Barcode SN from the response

        // Check if the item is already in the array to avoid duplicates
        if (!items.some(existingItem => existingItem.id === item.id)) {
          setItems(prevItems => [
            ...prevItems,
            { ...item, invoiceNumber, qty } // Append new item with fixed invoice number
          ]);
        } else {
          setError(`Item with SKU "${sku}" already added.`);
        }

        setQty(1); // Reset quantity to 1 when a new item is fetched
      } else {
        // Reset barcode and invoice if SKU is empty
        setBarcodeSn('');
        setQty(1); // Reset quantity to 1 if SKU is empty
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Unexpected error occurred while importing data.');
      }
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  // Use effect to automatically trigger the search when debouncedSku changes
  useEffect(() => {
    if (debouncedSku) {
      handleSearchBySku(debouncedSku); // Trigger the search when the debounced value changes
    } else {
      // Reset the barcode SN if the SKU is empty
      setBarcodeSn('');
    }
  // eslint-disable-next-line no-console
  }, [debouncedSku]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when submitting

    try {
      await addScannedItems(items); // Ensure items are structured correctly
      handleClearAll()
      setSuccessMessage('Items submitted successfully!'); // Set success message
      setTimeout(() => {
          setSuccessMessage(''); // Clear success message after 6 seconds
      }, 6000);
      setError(null); // Clear any existing error messages
    } catch (error) {
      console.error('Error during submission:', error);
      setError('Error during submission, please try again.'); // Set error message
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  // Function to clear all items and reset fields
  const handleClearAll = () => {
    setSku('');
    setInvoiceNumber('');
    setBarcodeSn('');
    setQty(1);
    setItems([]); // Clear the scanned items
    setError(null); // Reset any error message
    setSuccessMessage(null); // Clear success message
  };

  // Function to undo the last added item
  const handleUndo = () => {
    setItems(prevItems => prevItems.slice(0, -1)); // Remove the last item from the scanned items
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          {/* SKU Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">SKU</span>
            </label>
            <input
              type="text"
              placeholder="Enter SKU"
              className="input input-bordered w-full"
              value={sku}
              onChange={(e) => setSku(e.target.value)} // Update SKU state
            />
          </div>

          {/* Invoice Number Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Invoice Number</span>
            </label>
            <input
              type="text"
              placeholder="Enter Invoice Number"
              className="input input-bordered w-full"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)} // Update Invoice Number state
            />
          </div>
        </div>

        {/* Barcode SN Input */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Barcode SN</span>
          </label>
          <input
            type="text"
            placeholder="Enter Barcode SN"
            className="input input-bordered w-full"
            value={barcodeSn}
            readOnly // Making this field read-only as it should be auto-filled
          />
        </div>

        {/* Loading Indicator */}
        {loading && <div className="text-blue-500 mt-2">Loading...</div>}

        {/* Error Message */}
        {error && <div className="text-red-500 mt-2">{error}</div>}

        {/* Success Message */}
        {successMessage && <div className="text-green-500 mt-2">{successMessage}</div>}

        {/* Submit Button */}
        <div className="mt-6">
          <button 
            type="submit" 
            className="btn btn-primary btn-sm" 
            disabled={items.length === 0 || loading} // Disable button if no items or loading
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button 
            type="button" 
            className="btn btn-warning ml-3 btn-sm" 
            onClick={handleUndo}
            disabled={items.length === 0} // Disable button if no items to undo
          >
            Undo
          </button>
          <button 
            type="button" 
            className="btn btn-danger ml-3 btn-sm" 
            onClick={handleClearAll}
          >
            Clear All
          </button>
        </div>
      </form>

      {/* Displaying the fetched items in a table */}
      {items.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Scanned Items</h3>
          <div className="overflow-x-auto">
            <table className="table table-bordered w-full mt-2">
              <thead>
                <tr className="bg-gray-200">
                  <th>SKU</th>
                  <th>Item ID</th>
                  <th>Barcode SN</th>
                  <th>Nama Barang</th>
                  <th>Invoice Number</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.sku}</td>
                    <td>{item.id}</td>
                    <td>{item.barcode_sn}</td>
                    <td>{item.nama_barang}</td>
                    <td>{item.invoiceNumber}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value);
                          setItems(prevItems =>
                            prevItems.map(it =>
                              it.id === item.id ? { ...it, qty: newQty } : it
                            )
                          );
                        }}
                        className="input input-bordered w-16"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default AddScanned;
