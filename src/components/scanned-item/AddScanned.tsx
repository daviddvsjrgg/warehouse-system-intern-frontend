/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { fetchMasterItemBySKU } from '@/api/master-item/master-item'; 
import { parseCookies } from 'nookies'; 
import useDebounce from '@/hooks/useDebounce'; 
import { addScannedItems } from '@/api/scanned-item/scanned-item'; 
import api from '@/services/axiosInstance'; 

const AddScanned = () => {
  const [sku, setSku] = useState(''); 
  const [invoiceNumber, setInvoiceNumber] = useState(''); 
  const [qty, setQty] = useState(1); 
  const [barcodeSN, setBarcodeSN] = useState(''); 
  const [items, setItems] = useState<any[]>([]); 
  const [error, setError] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false); 
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 
  const debouncedSKU = useDebounce(sku, 500); 
  const debouncedBarcodeSN = useDebounce(barcodeSN, 500);

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
      const errorMessage = (error as Error).message || "Unknown error";
      setError('Failed to fetch user information.' + errorMessage);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  const handleSearchBySKU = async (debouncedSKU: string) => {
    setError(null); 
    setLoading(true);   

    if (!invoiceNumber || !debouncedSKU) {
      setError('Invoice Number and SKU are required.');
      setLoading(false); 
      return; 
    }

    try {
      const item = await fetchMasterItemBySKU(debouncedSKU);

      // Check if the barcode already exists in items
      const barcodeExists = items.some(existingItem => existingItem.barcode_sn === barcodeSN);
      
      if (barcodeExists) {
        setError(`Barcode "${barcodeSN}" already exists. Please use a unique barcode.`);
        setLoading(false);
        return;
      }

      // Always add a new item since SKU or Barcode can be the same
      setItems(prevItems => [
        ...prevItems,
        { ...item, invoiceNumber, qty, sku, barcode_sn: barcodeSN }
      ]);

      // Reset fields after adding
      setBarcodeSN('');
      setQty(1);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error occurred while importing data.');
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (debouncedBarcodeSN && debouncedSKU && invoiceNumber) {
      handleSearchBySKU(debouncedSKU); 
    }
  }, [debouncedBarcodeSN, debouncedSKU, invoiceNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 

    try {
      await addScannedItems(items);
      handleClearAll();
      setSuccessMessage('Items submitted successfully!'); 
      setTimeout(() => {
          setSuccessMessage(''); 
      }, 6000);
      setError(null); 
    } catch (error) {
      console.error('Error during submission:', error);
      setError('Error during submission, please try again.'); 
    } finally {
      setLoading(false); 
    }
  };

  const handleClearAll = () => {
    setSku('');
    setInvoiceNumber('');
    setQty(1);
    setBarcodeSN('');
    setItems([]); 
    setError(null); 
    setSuccessMessage(null); 
  };

  const handleUndo = () => {
    setItems(prevItems => prevItems.slice(0, -1)); 
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Invoice Number</span>
            </label>
            <input
              type="text"
              placeholder="Enter Invoice Number"
              className="input input-bordered w-full"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text">SKU</span>
            </label>
            <input
              type="text"
              placeholder="Enter SKU"
              className="input input-bordered w-full"
              value={sku}
              onChange={(e) => setSku(e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Barcode SN</span>
            </label>
            <input
              type="text"
              value={barcodeSN}
              onChange={(e) => setBarcodeSN(e.target.value)} 
              placeholder="Enter Barcode SN"
              className="input input-bordered w-full"
            />
          </div>
        </div>

        {loading && <div className="text-blue-500 mt-2">Loading...</div>}
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {successMessage && <div className="text-green-500 mt-2">{successMessage}</div>}

        <div className="mt-6">
          <button 
            type="submit" 
            className="btn btn-primary btn-sm" 
            disabled={items.length === 0 || loading} 
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button 
            type="button" 
            className="btn btn-warning ml-3 btn-sm" 
            onClick={handleUndo}
            disabled={items.length === 0} 
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
                          if (newQty > 0) {
                            setItems(prevItems =>
                              prevItems.map(it =>
                                it.id === item.id ? { ...it, qty: newQty } : it
                              )
                            );
                          }
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
