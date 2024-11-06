/* eslint-disable */ 
import React, { useState, useEffect } from 'react';
import { fetchMasterItems, Item } from '@/api/master-item/master-item';
import { addScannedItems, fetchScannedItems } from '@/api/scanned-item/scanned-item';
import useDebounce from '@/hooks/useDebounce';

interface PreviewItem {
  invoiceNumber: string;
  sku: string;
  namaBarang: string;
  barcode_sn: string;
  qty: number;
}

const AddScanned = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState('Cari Barang'); // Keeps placeholder
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingAddingItem, setLoadingAddingItem] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [barcodeSN, setBarcodeSN] = useState('');
  const [error, setError] = useState({
    invoiceNumber: '',
    selectedItem: '',
    barcodeSN: '',
    submitError: ''
  });
  const [itemList, setItemList] = useState<Array<any>>([]); // Holds multiple items for preview

  const per_page = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      loadItems(1);
    }
  };

  const loadItems = async (page: number) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await fetchMasterItems(page, debouncedSearchTerm, per_page);
      const newItems = response.data.data;
      setItems((prev) => (page === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(newItems.length === per_page);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isBottom && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadItems(nextPage);
    }
  };

  useEffect(() => {
    if (debouncedSearchTerm || debouncedSearchTerm === '') {
      setItems([]);
      setPage(1);
      setHasMore(true);
      loadItems(1);
    }
  }, [debouncedSearchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    if (newValue.trim() === "") {
      setItems([]);      // Clear items when search is cleared
      setPage(1);        // Reset pagination
      setHasMore(true);  // Reset load more flag
      loadItems(1);      // Trigger new fetch for full list
    }
  };

  const handleAddItem = async () => {
    let hasError = false;

    // Reset error state first
    setError({
      invoiceNumber: '',
      selectedItem: '',
      barcodeSN: '',
      submitError: ''
    });

    // Check if invoice number is empty
    if (!invoiceNumber) {
      setError(prev => ({ ...prev, invoiceNumber: 'Invoice Number is required.' }));
      hasError = true;
    }

    // Check if item is selected
    if (!selectedItemId) {
      setError(prev => ({ ...prev, selectedItem: 'Please select an item.' }));
      hasError = true;
    }

    // Check if barcode SN is empty
    if (!barcodeSN) {
      setError(prev => ({ ...prev, barcodeSN: 'Barcode SN is required.' }));
      hasError = true;
    }

    // Check if the barcode SN already exists in the preview list
    const isBarcodeInPreview = itemList.some(item => item.barcode_sn.toLowerCase() === barcodeSN.toLowerCase());
    if (isBarcodeInPreview) {
      setError(prev => ({ ...prev, barcodeSN: 'This Barcode SN is already added.' }));
      hasError = true;
    }

    if (hasError) return;

    setLoadingAddingItem(true);  // Start loading

    try {
      // Fetch scanned items to check for duplicates by invoiceNumber
      const existingInvoiceItems = await fetchScannedItems(1, 5, invoiceNumber.toLowerCase()); // Search by invoiceNumber (case-insensitive)
      const existingBarcodeItems = await fetchScannedItems(1, 5, barcodeSN.toLowerCase()); // Search by barcodeSN (case-insensitive)

      const isInvoiceDuplicate = existingInvoiceItems.some(item => item.invoice_number.toLowerCase() === invoiceNumber.toLowerCase());
      const isBarcodeDuplicate = existingBarcodeItems.some(item => item.barcode_sn.toLowerCase() === barcodeSN.toLowerCase());

      if (isInvoiceDuplicate) {
        setError(prev => ({ ...prev, invoiceNumber: 'Invoice number already exists.' }));
        setLoadingAddingItem(false);  // Stop loading
        return;
      }

      if (isBarcodeDuplicate) {
        setError(prev => ({ ...prev, barcodeSN: 'Barcode SN already exists.' }));
        setLoadingAddingItem(false);  // Stop loading
        return;
      }

      // Proceed to add item to the list if no duplicates
      const newItem = {
        id: selectedItemId, // Added item ID for submission
        invoiceNumber: invoiceNumber,
        sku: selectedItem.split(' | ')[0],
        namaBarang: selectedItem.split(' | ')[1],
        barcode_sn: barcodeSN,
        qty: 1,
      };

      setItemList((prevList) => [...prevList, newItem]);

      // Clear inputs after adding to preview
      setBarcodeSN('');
      setLoadingAddingItem(false);  // Stop loading
    } catch (error) {
      console.error('Error checking duplicates:', error);
      setLoadingAddingItem(false);  // Stop loading on error
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (itemList.length === 0) return; // If no items in list, do not submit
  
    setLoading(true); // Set loading state for submission
  
    try {
      let invoiceDuplicateMessage = '';
      let barcodeDuplicateMessage = '';
  
      // Loop through each item to check for duplicates by invoiceNumber or barcodeSN
      for (const item of itemList) {
        // Check for duplicates by invoiceNumber
        const existingInvoiceItems = await fetchScannedItems(1, 5, item.invoiceNumber.toLowerCase());
        const isInvoiceDuplicate = existingInvoiceItems.some(existingItem => 
          existingItem.invoice_number.toLowerCase() === item.invoiceNumber.toLowerCase()
        );
  
        // Check for duplicates by barcodeSN
        const existingBarcodeItems = await fetchScannedItems(1, 5, item.barcode_sn.toLowerCase());
        const isBarcodeDuplicate = existingBarcodeItems.some(existingItem => 
          existingItem.barcode_sn.toLowerCase() === item.barcode_sn.toLowerCase()
        );
  
        // If there is a duplicate invoiceNumber
        if (isInvoiceDuplicate) {
          invoiceDuplicateMessage = 'One or more scanned items have a duplicate invoice number.';
        }
  
        // If there is a duplicate barcodeSN
        if (isBarcodeDuplicate) {
          barcodeDuplicateMessage = 'One or more scanned items have a duplicate barcode SN.';
        }
  
        // If both duplicates are found, break out of the loop
        if (invoiceDuplicateMessage || barcodeDuplicateMessage) {
          break;
        }
      }
  
      // If duplicates are found, update the submitError state
      if (invoiceDuplicateMessage || barcodeDuplicateMessage) {
        setError(prev => ({
          ...prev,
          submitError: `${invoiceDuplicateMessage} ${barcodeDuplicateMessage}`.trim(),
        }));
        setLoading(false); // Stop loading state
        return; // Exit the function, no need to submit
      }
  
      // Proceed with the submission if no duplicates
      const response = await addScannedItems(itemList);
      console.log('Items added successfully:', response);
  
      // Clear inputs after successful submission
      setInvoiceNumber('');
      setItemList([]);
      setSelectedItem('Cari Barang');
      setSelectedItemId(null);
      setBarcodeSN('');
      setLoading(false); // Stop loading after submission
  
    } catch (error) {
      console.error('Error submitting items:', error);
      setLoading(false); // Stop loading in case of error
    }
  };

  const filteredItems = items.filter(item =>
    item.nama_barang.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

   // Function to undo (remove the last added item)
   const handleUndo = () => {
    setItemList((prevList) => prevList.slice(0, -1)); // Remove last item from itemList
  };

  // Function to clear all items
  const handleClearAll = () => {
    setItemList([]); // Clear all items from itemList
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Scan SN */}  
      <div className="space-y-3">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
          <input
            type="text"
            placeholder="Enter Invoice Number"
            className="input input-bordered w-full"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
          {error.invoiceNumber && <div className="text-red-600 text-sm mt-1">{error.invoiceNumber}</div>}
        </div>

        <div className="relative w-1/2">
          <label className="text-sm font-medium text-gray-700">SKU / Nama Barang</label>
          <button
            type="button"
            onClick={toggleDropdown}
            className="flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-200"
          >
            <span>{selectedItem}</span> {/* This will show 'Cari Barang' until an item is selected */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-1 max-h-60 overflow-auto z-10"
                 onScroll={handleScroll}>
              <input
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full px-4 py-2 text-gray-800 border rounded-md border-gray-300 focus:outline-none"
                type="text"
                placeholder="Search items"
                autoComplete="off"
              />

              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <a key={item.id} onClick={() => { setSelectedItem(`${item.sku} | ${item.nama_barang}`); setSelectedItemId(item.id); setIsOpen(false); }} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                    {item.sku} | {item.nama_barang}
                  </a>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">No items found</div>
              )}
              {loading && <div className="px-4 py-2 text-gray-500">Loading...</div>}
            </div>
          )}
          {error.selectedItem && <div className="text-red-600 text-sm mt-1">{error.selectedItem}</div>}
        </div>

        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Barcode SN</label>
          <input
            type="text"
            placeholder="Enter Barcode SN"
            className="input input-bordered w-full"
            value={barcodeSN}
            onChange={(e) => setBarcodeSN(e.target.value)}
          />
          {error.barcodeSN && <div className="text-red-600 text-sm mt-1">{error.barcodeSN}</div>}
        </div>

        <button
          type="button"
          className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 w-1/2"
          onClick={handleAddItem}
          disabled={loadingAddingItem}
        >
          {loadingAddingItem ? 'Adding...' : 'Add Item'}
        </button>
      </div>

      <div className='divider'></div>
      {/* Summary */}
      <div className="w-1/2 mt-4">
        <div className="font-bold mb-2">Summary</div>
        <div className="grid grid-cols-1 gap-2 bg-white p-4 border border-gray-300 rounded-lg shadow-md">
          <div className="flex justify-between">
            <span className="font-medium">Total Quantity (All Invoices):</span>
            <span>{itemList.reduce((sum, item) => sum + item.qty, 0)}</span>
          </div>
            <div className='divider -my-2'></div>
          {Object.entries(
            itemList.reduce<{ [key: string]: PreviewItem[] }>((acc, item) => {
              if (!acc[item.invoiceNumber]) {
                acc[item.invoiceNumber] = [];
              }
              acc[item.invoiceNumber].push(item);
              return acc;
            }, {})
          ).map(([invoiceNumber, invoiceItems]) => {
            const totalInvoiceQuantity = invoiceItems.reduce((sum, item) => sum + item.qty, 0);
            return (
              <div key={invoiceNumber} className="flex justify-between">
                <span>Invoice {invoiceNumber} Total Quantity:</span>
                <span>{totalInvoiceQuantity}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className='divider'></div>
      {/* Items Preview */}  
      <div className=''>
         {itemList.length > 0 && (
          <div className="mt-4">
            <div className='flex justify-between'>
              <h3 className="text-lg font-semibold">Items Preview</h3>
              {/* Undo and Clear All Buttons */}
              <div className="flex my-2">
                <button
                  type="button"
                  className="btn btn-warning mx-2 btn-sm"
                  onClick={handleUndo}
                  disabled={itemList.length === 0}
                >
                  Undo
                </button>
                <button
                  type="button"
                  className="btn btn-sm bg-gray-500 text-white"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Group items by invoiceNumber */}
            {Object.entries(
              itemList.reduce<{ [key: string]: PreviewItem[] }>((acc, item) => {
                if (!acc[item.invoiceNumber]) {
                  acc[item.invoiceNumber] = [];
                }
                acc[item.invoiceNumber].push(item);
                return acc;
              }, {})
            ).map(([invoiceNumber, invoiceItems]) => (
              <div key={invoiceNumber} className="collapse collapse-plus bg-white bg-blur-100 border border-gray-300 rounded-lg shadow-md mb-4">
                <input type="checkbox" className="collapse-checkbox" id={`invoice-${invoiceNumber}`} />
                <div className="collapse-title text-xl font-medium">
                  Invoice: {invoiceNumber}
                </div>
                <div className="collapse-content">
                  {/* Group items by sku | namaBarang */}
                  {Object.entries(
                    invoiceItems.reduce<{ [key: string]: PreviewItem[] }>((skuAcc, item) => {
                      const key = `${item.sku} | ${item.namaBarang}`;
                      if (!skuAcc[key]) {
                        skuAcc[key] = [];
                      }
                      skuAcc[key].push(item);
                      return skuAcc;
                    }, {})
                  ).map(([sku, skuItems]) => {
                    // Calculate the total quantity for the SKU group
                    const totalQuantity = skuItems.reduce((sum, item) => sum + item.qty, 0);

                    return (
                      <div key={sku} className="collapse collapse-arrow bg-white bg-opacity-80 border border-gray-300 rounded-lg shadow-md mb-2">
                        <input type="checkbox" className="collapse-checkbox" id={`sku-${sku}`} />
                        <div className="collapse-title text-lg font-medium">
                          {sku}
                          <span className="ml-4 text-sm text-gray-500">(Total Quantity: {totalQuantity})</span>
                        </div>
                        <div className="collapse-content">
                          {/* Display barcode and quantity in a table with borders */}
                          <table className="min-w-full table">
                            <thead>
                              <tr className="text-left bg-gray-50">
                                <th className="px-4 py-2">Barcode SN</th>
                                <th className="px-4 py-2">Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {skuItems.map((item) => (
                                <tr key={item.barcode_sn} className="bg-white hover:bg-gray-100">
                                  <td className="px-4 py-2">{item.barcode_sn}</td>
                                  <td className="px-4 py-2">{item.qty}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}


        {itemList.length > 0 && (
         <div className="mt-4">
            <button type="submit" className="btn btn-primary w-1/2" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Scanned Items'}
            </button>
        
            {/* Display error below the submit button if there is a submission error */}
            {error.submitError && (
              <div className="mt-3 text-red-600 text-sm">{error.submitError}</div>
            )}
          </div>
        )}  
      </div>
    </form>
  );
};

export default AddScanned;