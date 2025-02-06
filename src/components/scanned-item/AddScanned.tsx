/* eslint-disable */ 
import React, { useState, useEffect, useRef } from 'react';
import { fetchMasterItems, Item } from '@/api/master-item/master-item';
import { addScannedItems, fetchScannedItems, fetchScannedItemsBatch } from '@/api/scanned-item/scanned-item';
import useDebounce from '@/hooks/useDebounce';
import * as XLSX from 'xlsx';
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
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [lastAddedBarcode, setLastAddedBarcode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleCardVisibility = () => {
    setIsCardVisible(prevState => !prevState);  
  };  

    const [error, setError] = useState({
      invoiceNumber: '',
      selectedItem: '',
      barcodeSN: '',
      submitError: '',
      submitInvoiceNumbers: [] as string[],  // To hold errors for invoice numbers
      submitBarcodeSNs: [] as string[],
    });

  const [autoInputEnabled, setAutoInputEnabled] = useState(false); // Checkbox state
  const [itemList, setItemList] = useState<Array<any>>([]); // Holds multiple items for preview

  const per_page = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedBarcodeSN = useDebounce(barcodeSN, 500);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      loadItems(1);
    }
  };

  // State to handle whether the dropdown is open or closed
  const [lainnyaIsOpen, setLainnyaIsOpen] = useState(false);

  // Function to toggle the dropdown state (open/close)
  const toggleLainnyaDropdown = () => {
    setLainnyaIsOpen((prev) => !prev); // Toggle the value of isOpen
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
    // Skip if barcodeSN is empty or if the error related to barcodeSN is set
    if (!autoInputEnabled || debouncedBarcodeSN.trim() === '') return;
  
    // If barcodeSN is valid, automatically add the item
    if (debouncedBarcodeSN) {
      handleAddItem();
    }
  }, [debouncedBarcodeSN]);

  useEffect(() => {
    // When either invoiceNumber or selectedItem (namaBarang) changes, clear the barcodeSN
    setBarcodeSN('');
  }, [invoiceNumber, selectedItem]); 

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
  
    // Reset error state
    setError({
      invoiceNumber: '',
      selectedItem: '',
      barcodeSN: '',
      submitError: '',
      submitInvoiceNumbers: [] as string[],
      submitBarcodeSNs: [] as string[],
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
  
    setLoadingAddingItem(true);
  
    try {
      // Fetch scanned items to check for duplicates by invoiceNumber
      const existingInvoiceItems = await fetchScannedItems(1, 5, invoiceNumber.toLowerCase());
      const existingBarcodeItems = await fetchScannedItems(1, 5, barcodeSN.toLowerCase());
  
      const isInvoiceDuplicate = existingInvoiceItems.some(item => item.invoice_number.toLowerCase() === invoiceNumber.toLowerCase());
      const isBarcodeDuplicate = existingBarcodeItems.some(item => item.barcode_sn.toLowerCase() === barcodeSN.toLowerCase());
  
      if (isInvoiceDuplicate) {
        setError(prev => ({ ...prev, invoiceNumber: 'Invoice ini sudah pernah ditambahkan.' }));
        setLoadingAddingItem(false);
        return;
      }
  
      if (isBarcodeDuplicate) {
        setError(prev => ({ ...prev, barcodeSN: 'This Barcode SN is already added.' }));
        setLoadingAddingItem(false);
        return;
      }
  
      // Proceed to add item to the list if no duplicates
      const newItem = {
        id: selectedItemId,
        invoiceNumber: invoiceNumber,
        sku: selectedItem.split(' | ')[0],
        namaBarang: selectedItem.split(' | ')[1],
        barcode_sn: barcodeSN,
        qty: 1,
      };
  
      // Update state
      setItemList((prevList) => {
        const updatedList = [...prevList, newItem];
        localStorage.setItem('scannedItems', JSON.stringify(updatedList));
  
        // Set the last added barcode for scrolling
        setLastAddedBarcode(barcodeSN);
  
        return updatedList;
      });
      
  
      // Clear inputs after adding to preview
      setBarcodeSN('');
      barcodeInputRef.current?.focus(); // Refocus the input field
      setLoadingAddingItem(false);
    } catch (error) {
      console.error('Error checking duplicates:', error);
      setLoadingAddingItem(false);
    }
  };
  
  useEffect(() => {
    if (lastAddedBarcode) {
      const element = document.getElementById(`row-${lastAddedBarcode}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [lastAddedBarcode]); // Trigger when `lastAddedBarcode` changes

  useEffect(() => {
    const savedItems = localStorage.getItem('scannedItems');
    if (savedItems) {
      setItemList(JSON.parse(savedItems));
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (itemList.length === 0) return;
  
    setLoading(true);
  
    try {
      // Extract invoice numbers and barcode SNs from the itemList
      const invoiceNumbers = itemList.map(item => item.invoiceNumber.toLowerCase());
      const barcodeSNs = itemList.map(item => item.barcode_sn.toLowerCase());
  
      // Fetch existing items matching these invoice numbers or barcode SNs
      const existingItems = await fetchScannedItemsBatch(invoiceNumbers, barcodeSNs);
  
      // Initialize sets to track duplicates
      const duplicateInvoices = new Set<string>();
      const duplicateBarcodes = new Set<string>();
  
      // Check for duplicates in the fetched data
      for (let i = 0; i < itemList.length; i++) {
        const item = itemList[i];
        const lowerInvoice = item.invoiceNumber.toLowerCase();
        const lowerBarcode = item.barcode_sn.toLowerCase();
  
        // Check for duplicate invoice numbers
        if (existingItems.some(existing => existing.invoice_number.toLowerCase() === lowerInvoice)) {
          duplicateInvoices.add(item.invoiceNumber);
        }
  
        // Check for duplicate barcode SNs
        if (existingItems.some(existing => existing.barcode_sn.toLowerCase() === lowerBarcode)) {
          duplicateBarcodes.add(item.barcode_sn);
        }
      }
  
      // Format error messages for duplicates
      let errorMessage = '';
  
      const barcodeSet = new Set<string>();
      for (let i = 0; i < itemList.length; i++) {
        const barcode = itemList[i].barcode_sn.toLowerCase();
        if (barcodeSet.has(barcode)) {
          setError(prev => ({ ...prev, barcodeSN: 'Duplicate Barcode SN found in the list.' }));
          const item = itemList[i];
          duplicateBarcodes.add(item.barcode_sn + " = Multiple Barcode SN Detected");
        }
        barcodeSet.add(barcode);
      }
      // Format duplicate invoices section
      if (duplicateInvoices.size > 0) {
        errorMessage += 'Duplicate Invoice Numbers:<br>';
        Array.from(duplicateInvoices).forEach((invoice, index) => {
          errorMessage += `${index + 1}. Invoice "${invoice}"<br>`;
        });
      }
  
      // Format duplicate barcode SNs section
      if (duplicateBarcodes.size > 0) {
        errorMessage += '<br>Duplicate Barcode SNs:<br>';
        Array.from(duplicateBarcodes).forEach((barcode, index) => {
          errorMessage += `${index + 1}. Barcode "${barcode}"<br>`;
        });
      }
  
      // If any duplicates are found, set the error message and stop the process
      if (errorMessage) {
        setError(prev => ({
          ...prev,
          submitError: errorMessage.trim(),
        }));
        setLoading(false);
        return;
      }
  
      const chunkArray = (array: any[], chunkSize: number) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
          chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
      };
      
      try {
        const chunks = chunkArray(itemList, 50);
      
        for (const chunk of chunks) {
          const response: any = await addScannedItems(chunk);
      
          if (response?.status_code !== 201 || response?.success === false) {
            setError(prevError => ({
              ...prevError,
              submitError: `Submit gagal karena barang tidak ada/terhapus.`,
            }));
            setLoading(false);
            return;
          }
      
          console.log('Items added successfully:', response);
        }
      } catch (error) {
        console.error('Error adding items:', error);
      } finally {
        setLoading(false);
      }
  
      // Clear inputs after successful submission
      setSuccessMessage('Barang berhasil discan!');
      setInvoiceNumber('');
      setItemList([]);
      localStorage.removeItem('scannedItems');
      setSelectedItem('Cari Barang');
      setSelectedItemId(null);
      setBarcodeSN('');
      setLoading(false);
      setError({
        invoiceNumber: '',
        selectedItem: '',
        barcodeSN: '',
        submitError: '',
        submitInvoiceNumbers: [] as string[],  // To hold errors for invoice numbers
        submitBarcodeSNs: [] as string[],
      });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
  
    } catch (error: any) {
      console.error('Error submitting items:', error);
      setError(prevError => ({
        ...prevError,
        submitError: `Server Error, ${error?.message}`,
      }));
      setLoading(false);
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
    localStorage.removeItem('scannedItems');
    setShowClearAllModal(false); // Close modal
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !autoInputEnabled && !loadingAddingItem) {
      handleAddItem();
    }
  };

  const [showModal, setShowModal] = useState(false);

  const handleDeleteItemPreview = () => {
    setItemList((prevList) => {
      // Filter out the item to delete
      const updatedList = prevList.filter((item) => item.barcode_sn !== selectedBarcode);
  
      // Update local storage
      localStorage.setItem('scannedItems', JSON.stringify(updatedList));
  
      return updatedList;
    });
  
    // Close the modal after deletion
    setShowModal(false);
  };

  const showModalDeleteItemPreview = (barcodeSn: any) => {
    setSelectedBarcode(barcodeSn);
    setShowModal(true);
  };

  // State to manage modal visibility, file, and importing state
  const [isOpenModalImport, setIsOpenModalImport] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Function to open the modal
  const openModalImport = () => {
    setIsOpenModalImport(true);
    setErrorMessage(""); // Reset error message when opening modal
  };

  // Function to close the modal
  const closeModalImport = () => {
    setIsOpenModalImport(false);
    setSelectedFile(null);
    setIsImporting(false);
    setErrorMessage(""); // Clear any error message when closing modal
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(""); // Clear any error message on file selection
    }
  };

  // Handle file import
  const handleImport = () => {
    try {
      if (!selectedFile) {
        setErrorMessage("Please select a valid Excel file.");
        return;
      }
  
      setIsImporting(true);
      console.log("Importing file:", selectedFile);
  
      const reader = new FileReader();
      reader.readAsArrayBuffer(selectedFile); // Use `readAsArrayBuffer` instead of deprecated `readAsBinaryString`
  
      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            throw new Error("Failed to read file.");
          }
  
          const arrayBuffer = e.target.result as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
  
          // Assuming the first sheet contains the data
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
  
          // Convert sheet data to JSON
          const importedData = XLSX.utils.sheet_to_json(sheet);
  
          // Map the data to match the required format
          const formattedData = importedData.map((row: any, index: number) => ({
            id: index + 1, // Generate unique ID if not provided
            invoiceNumber: row["Invoice"] || "",
            sku: row["SKU"] || "",
            namaBarang: row["Nama Barang"] || "",
            barcode_sn: row["Barcode SN"] || "",
            qty: row["Qty"] || 1, // Default to 1 if missing
          }));
  
          // ✅ Replace `scannedItems` in localStorage
          localStorage.setItem("scannedItems", JSON.stringify(formattedData));
  
          // ✅ Update state with the new data
          setItemList(formattedData);
  
          closeModalImport();
        } catch (error: any) {
          setErrorMessage("Error processing file: " + error.message);
        } finally {
          setIsImporting(false);
        }
      };
  
      reader.onerror = () => {
        setErrorMessage("Error reading file.");
        setIsImporting(false);
      };
    } catch (error: any) {
      setErrorMessage("Unexpected error: " + error.message);
      setIsImporting(false);
    }
  };

  const handleCopyToExcel = () => {
    // Prepare data for Excel
    const excelData = itemList.map(item => ({
      ID: item.id,
      Invoice: item.invoiceNumber,
      SKU: item.sku,
      "Nama Barang": item.namaBarang,
      "Barcode SN": item.barcode_sn,
      Qty: item.qty
    }));

  
    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(excelData);
  
    // Set column widths (adjust based on content)
    worksheet['!cols'] = [
      { wch: 10 },  // ID column width
      { wch: 15 },  // Invoice column width
      { wch: 20 },  // SKU column width
      { wch: 30 },  // Nama Barang column width
      { wch: 25 },  // Barcode_SN column width
      { wch: 10 },  // Qty column width
    ];
  
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');
  
    // Trigger file download
    XLSX.writeFile(workbook, 'Preview_Items_List.xlsx');
};


  return (
    <div>
      {/* Success Submit */}
      {successMessage && (
        <div
          role="alert"
          className="fixed flex mr-2 bottom-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-bounce transition-all duration-500 z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className='ml-2'>{successMessage}</span>
        </div>
      )}
      {/* Daisy UI Modal */}
      {showClearAllModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg">Hapus semua barang yang telah discan?</h2>
            <p className="py-4">Do you really want to clear all items?</p>
            <div className="modal-action">
              <button
                className="btn btn-warning"
                onClick={handleClearAll} // Confirm action
              >
                Yes
              </button>
              <button
                className="btn"
                onClick={() => setShowClearAllModal(false)} // Cancel action
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={toggleCardVisibility}
          className="bg-blue-500 text-white rounded-md hover:bg-blue-600 btn-sm"
        >
          {isCardVisible ? "Tutup Card" : "Tampilkan Card"}
        </button>

        <button
          className="btn btn-sm btn-success text-white flex items-center gap-2"
          onClick={openModalImport}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 48 48"
          >
            <path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"></path>
            <path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"></path>
            <path fill="#2E7D32" d="M27 42L6 38 6 10 27 6z"></path>
            <path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"></path>
          </svg>
          Import Excel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        
        <div className="col-span-1">
          {/* Scan SN */}  

          {/* Modal */}
          {isOpenModalImport && (
            <div className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Import Excel File</h3>
                <p className="py-2">Choose an Excel file to import:</p>

                {/* File input */}
                <input
                  type="file"
                  className="file-input file-input-bordered w-full max-w-xs"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
                <p className="py-4">Note: Import ini akan menggantikan seluruh SCAN SN, Format kolom seperti hasil export.</p>

                {/* Error message */}
                {errorMessage && (
                  <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                )}

                {/* Show the Import and Close buttons side by side */}
                <div className="flex justify-end gap-2 mt-4">
                {selectedFile && (
                    <button
                      className={`btn btn-primary btn-md ${isImporting ? "animate-pulse" : ""}`}
                      onClick={handleImport}
                      disabled={isImporting}
                    >
                      {isImporting ? "Importing..." : "Import"}
                    </button>
                )}
                    <button className="btn btn-md" onClick={closeModalImport}>
                      Close
                    </button>
                  </div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Invoice Number</label>
              <input
                type="text"
                placeholder="Enter Invoice Number"
                className="input input-bordered w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                value={invoiceNumber}
                onKeyDown={handleKeyDown} // Handle Enter key press
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
              {error.invoiceNumber && <div className="text-red-600 text-sm mt-1">{error.invoiceNumber}</div>}
            </div>

            <div className="relative w-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                SKU / Nama Barang
              </label>
              <button
                type="button"
                onClick={toggleDropdown}
                className="flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-gray-200 dark:focus:ring-gray-500"
              >
                <span>{selectedItem}</span> {/* This will show 'Cari Barang' until an item is selected */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isOpen && (
                <div
                  className="absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-opacity-10 p-1 max-h-60 overflow-auto z-10"
                  onScroll={handleScroll}
                >
                  <input
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="block w-full px-4 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border rounded-md border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-500"
                    type="text"
                    placeholder="Search items"
                    autoComplete="off"
                  />

                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <a
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(`${item.sku} | ${item.nama_barang}`);
                          setSelectedItemId(item.id);
                          setIsOpen(false);
                        }}
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        {item.sku} | {item.nama_barang}
                      </a>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No items found</div>
                  )}
                  {loading && <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Loading...</div>}
                </div>
              )}
              {error.selectedItem && (
                <div className="text-red-600 dark:text-red-400 text-sm mt-1">{error.selectedItem}</div>
              )}
            </div>


            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Barcode SN
              </label>
              <input
                type="text"
                placeholder="Enter Barcode SN"
                className="input input-bordered w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                value={barcodeSN}
                onKeyDown={handleKeyDown} // Handle Enter key press
                onChange={(e) => setBarcodeSN(e.target.value)}
              />
              {error.barcodeSN && (
                <div className="text-red-600 text-sm mt-1">{error.barcodeSN}</div>
              )}

              {/* Checkbox for enabling/disabling auto-input */}
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="autoInputCheckbox"
                  className="checkbox mr-2"
                  checked={autoInputEnabled}
                  onChange={(e) => setAutoInputEnabled(e.target.checked)}
                />
                <label
                  htmlFor="autoInputCheckbox"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Enable Auto Input
                </label>
              </div>
            </div>

            <button
              type="button"
              className={` py-2 rounded-md w-full ${loadingAddingItem ? 'bg-gray-300 text-white animate-pulse' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              onClick={handleAddItem}
              disabled={loadingAddingItem}
            >
              {loadingAddingItem ? 'Adding...' : 'Add Item'}
            </button>
          </div>
          {/* Floating Scan */}
          <div className="fixed top-0 right-0 p-4 w-96 max-w-full z-20">
            <div
              className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg rounded-lg p-6 w-full transition-opacity duration-500 ease-in-out ${
                isCardVisible ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              {/* Close Button at the top-right */}
              <button
                onClick={() => setIsCardVisible(false)} // Calls the toggle function on click
                className="float-right pb-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="space-y-3">
                {/* Invoice Number Section */}
                <div className="w-full">
                  <label className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Invoice Number</label>
                  <input
                    type="text"
                    placeholder="Enter Invoice Number"
                    className="input input-bordered w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    value={invoiceNumber}
                    onKeyDown={handleKeyDown} // Handle Enter key press
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                  {error.invoiceNumber && <div className="text-red-600 text-sm mt-1">{error.invoiceNumber}</div>}
                </div>

                {/* SKU / Nama Barang Section */}
                <div className="relative w-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SKU / Nama Barang</label>
                  <button
                    type="button"
                    onClick={toggleDropdown}
                    className="flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-gray-200 dark:focus:ring-gray-500"
                  >
                    <span>{selectedItem}</span> {/* This will show 'Cari Barang' until an item is selected */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isOpen && (
                    <div
                      className="absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-opacity-10 p-1 max-h-60 overflow-auto z-10"
                      onScroll={handleScroll}
                    >
                      <input
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="block w-full px-4 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border rounded-md border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-500"
                        type="text"
                        placeholder="Search items"
                        autoComplete="off"
                      />
                      {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                          <a
                            key={item.id}
                            onClick={() => {
                              setSelectedItem(`${item.sku} | ${item.nama_barang}`);
                              setSelectedItemId(item.id);
                              setIsOpen(false);
                            }}
                            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                          >
                            {item.sku} | {item.nama_barang}
                          </a>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No items found</div>
                      )}
                      {loading && <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Loading...</div>}
                    </div>
                  )}
                  {error.selectedItem && (
                    <div className="text-red-600 dark:text-red-400 text-sm mt-1">{error.selectedItem}</div>
                  )}
                </div>

                {/* Barcode SN Section */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Barcode SN</label>
                  <input
                    type="text"
                    ref={barcodeInputRef} 
                    placeholder="Enter Barcode SN"
                    className="input input-bordered w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    value={barcodeSN}
                    onKeyDown={handleKeyDown} // Handle Enter key press
                    onChange={(e) => setBarcodeSN(e.target.value)}
                  />
                  {error.barcodeSN && <div className="text-red-600 text-sm mt-1">{error.barcodeSN}</div>}

                  {/* Checkbox for enabling/disabling auto-input */}
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="autoInputCheckbox"
                      className="checkbox mr-2"
                      checked={autoInputEnabled}
                      onChange={(e) => setAutoInputEnabled(e.target.checked)}
                    />
                    <label
                      htmlFor="autoInputCheckbox"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Enable Auto Input
                    </label>
                  </div>
                </div>

                {/* Add Item Button */}
                <button
                  type="button"
                  className={`py-2 rounded-md w-full ${loadingAddingItem ? 'bg-gray-300 text-white animate-pulse' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  onClick={handleAddItem}
                  disabled={loadingAddingItem}
                >
                  {loadingAddingItem ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>

        </div>
        <div className="col-span-1">
          {/* Summary */}
            <div className="w-full">
              <div className="font-bold">Summary</div>
              <div className="bg-white dark:bg-gray-800 p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md">
                <div className="flex justify-between">
                  <span className="font-medium">Total Quantity (All Invoices):</span>
                  <span>{itemList.reduce((sum, item) => sum + item.qty, 0)}</span>
                </div>
                <div className='divider my-2'></div>
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
        </div>
      </div>
      <div className='divider'></div>
      {/* Items Preview */}  
      <div className=''>
         {itemList.length > 0 && (
          <div className="mt-4">
            <div className='flex justify-between'>
              <h3 className="text-lg font-semibold flex">
                Items Preview ({itemList.length}/2000) <p className='text-sm ml-0.5 text-gray-400 dark:text-white'>limit</p>
              </h3>
              {/* Undo , Copy to Excel, & Clear All Buttons */}
              <div className="flex my-2">
                <button className="btn btn-sm mx-2 btn-success text-white" onClick={handleCopyToExcel}>
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 48 48">
                    <path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"></path><path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"></path><path fill="#2E7D32" d="M27 42L6 38 6 10 27 6z"></path><path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"></path>
                  </svg>
                  Export Excel
                </button>
                <div className="dropdown dropdown-end ml-2">
                  <label
                    tabIndex={0}
                    className="btn btn-sm bg-white text-gray-700 dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 flex items-center"
                    onClick={toggleLainnyaDropdown} // Attach the toggleLainnyaDropdown function to the onClick event
                  >
                    Other Menu
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={`ml-2 w-5 h-5 transform transition-transform ${
                        lainnyaIsOpen ? 'rotate-180' : ''
                      }`} // Rotate the SVG based on lainnyaIsOpen state
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </label>
                  <ul
                    tabIndex={0}
                    className={`dropdown-content z-50 menu p-2 shadow bg-base-100 border border-gray-300 dark:border-gray-600 rounded-box w-44 mt-2 ${
                      lainnyaIsOpen ? 'block' : 'hidden'
                    }`} // Show the dropdown content if lainnyaIsOpen is true
                  >
                    <li className='mb-2'>
                      <button
                        type="button"
                        className="btn btn-ghost mx-2 btn-sm"
                        onClick={handleUndo}
                        disabled={itemList.length === 0}
                      >
                        Undo
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost hover:bg-red-500 hover:text-white"
                        onClick={() => setShowClearAllModal(true)} // Show modal
                      >
                        Clear All
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Group items by invoiceNumber */}
            {showModal && (
              <div className="modal modal-open">
                <div className="modal-box">
                  <h3 className="font-bold text-lg">Confirm Deletion</h3>
                  <p className="py-4">Are you sure you want to delete this item? | {selectedBarcode}</p>
                  <div className="modal-action">
                    <button
                      className="btn btn-error text-white"
                      onClick={handleDeleteItemPreview}
                    >
                      Yes
                    </button>
                    <button
                      className="btn"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {Object.entries(
              itemList.reduce<{ [key: string]: PreviewItem[] }>((acc, item) => {
                if (!acc[item.invoiceNumber]) {
                  acc[item.invoiceNumber] = [];
                }
                acc[item.invoiceNumber].push(item);
                return acc;
              }, {})
            ).map(([invoiceNumber, invoiceItems]) => (
              <div
                key={invoiceNumber}
                className="collapse collapse-plus bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md mb-4"
              >
                <input
                  type="checkbox"
                  className="collapse-checkbox"
                  id={`invoice-${invoiceNumber}`}
                  defaultChecked // Open by default
                />
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
                      <div
                        key={sku}
                        className="collapse collapse-arrow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md mb-2"
                      >
                        <input
                          type="checkbox"
                          className="collapse-checkbox"
                          id={`sku-${sku}`}
                          defaultChecked // Open by default
                        />
                        <div className="collapse-title text-lg font-medium">
                          {sku}
                          <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                            (Total Quantity: {totalQuantity})
                          </span>
                        </div>
                        <div className="collapse-content">
                          {/* Display barcode and quantity in a table with borders */}
                          <table className="min-w-full table">
                            <thead>
                              <tr className="text-left bg-gray-50 dark:bg-gray-700">
                                <th className="px-4 py-2 text-gray-700 dark:text-gray-300 w-16">
                                  No
                                </th>
                                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                  Barcode SN
                                </th>
                                <th className="px-4 py-2 text-gray-700 dark:text-gray-300 w-20">
                                  Action/s
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                            {skuItems.map((item, index) => (
                              <tr
                                key={item.barcode_sn}
                                className={`bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 ${lastAddedBarcode === item.barcode_sn ? 'animate-pulse bg-green-100 ' : ''}`}
                                id={`row-${item.barcode_sn}`}
                              >
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{index + 1}</td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.barcode_sn}</td>
                                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                  <button
                                    onClick={() => showModalDeleteItemPreview(item.barcode_sn)}
                                    className="flex items-center justify-center text-red-500 hover:text-red-700 tooltip"
                                    data-tip="Hapus Scan Ini?"
                                    aria-label="Delete"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-5 h-5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                      />
                                    </svg>
                                  </button>
                                </td>
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
          <>
            <div className="relative">
            {/* Button to open the modal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary w-1/2"
            >
              Submit
            </button>
            {error.submitError && (
              <div
                className="mt-3 text-red-600 text-sm"
                dangerouslySetInnerHTML={{ __html: error.submitError }}
              />
            )}
            {/* DaisyUI Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                <div className="modal modal-open">
                  <div className="modal-box">
                    <h2 className="text-xl font-semibold mb-4">Apakah yakin untuk mengirim scan sn?</h2>
                    <p className="text-sm mb-6 text-gray-700">Data akan masuk kedalam database.</p>
                    
                    {error.submitError && (
                      <div
                        className="mt-3 text-red-600 text-sm"
                        dangerouslySetInnerHTML={{ __html: error.submitError }}
                      />
                    )}

                    {/* Modal Footer with Cancel and Submit Buttons */}
                    <div className="modal-action flex justify-end">
                      {/* Cancel Button */}
                      <button
                        className="btn mr-2"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </button>
                      {/* Submit Button */}
                      <button
                        onClick={handleSubmit}
                        className={`btn btn-primary ${loading ? 'animate-pulse' : ''}`}
                        disabled={loading}
                      >
                        {loading ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </>
        )}  
      </div>
    </div>
  );
};

export default AddScanned;