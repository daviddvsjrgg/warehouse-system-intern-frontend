"use client"

import React, { useState } from 'react';
import { addMasterItems } from '@/api/master-item/master-item';
import * as XLSX from 'xlsx';

// Define the interface for the expected structure of the Excel data
interface ExcelItem {
  SKU: string; // Match the column name in your Excel sheet
  'Nama Barang': string; // Match the column name in your Excel sheet
}

const AddMaster: React.FC = () => {
  const [sku, setSku] = useState<string>('');
  const [nama_barang, setNamaBarang] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // State to manage button disabled status
  const [file, setFile] = useState<File | null>(null); // State to store the selected file
  const [isImporting, setIsImporting] = useState<boolean>(false); // State to manage the import button status

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true); // Disable the button on form submission

    // Validation: Check if any field is empty
    if (!sku || !nama_barang) {
      setError('All fields are required!');
      setIsSubmitting(false); // Re-enable the button if validation fails
      return; // Stop the function if fields are empty
    }
    const barcode_sn = `${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 7)}`;

    // Prepare the new item to be added
    const newItem = {
      sku,
      nama_barang,
      barcode_sn : `${barcode_sn}`
    };

    try {
      setError('');

      // Create an array for batch submission
      const itemsToAdd = [newItem];

      // Call the batch function to add items and capture the response in `addedItems`
      const addedItems = await addMasterItems(itemsToAdd); // This is the full response object

      // Check the response status code (assuming 200 for success, others for errors)
      if (addedItems.status_code === 201) {
        // If the request was successful, get the success message
        const successMessage = addedItems.message || 'Items added successfully!';
        setSuccess(successMessage); // Display success message
        // Reset input fields after successful submission
        setSku('');
        setNamaBarang('');
        setTimeout(() => {
          setSuccess(''); // Display success message
        }, 6000);
      } else {
        // If the request failed (status_code is not 200), get the error message
        setError(addedItems.message || 'An unknown error occurred.'); // Display error message
      }

      console.log('Added Items:', addedItems);
      
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button after submission attempt
    }
  };

  // Function to handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      setFile(fileList[0]); // Set the first file as the selected file
    } else {
      setFile(null); // Reset file if no file is selected
    }
  };

  // Function to handle Excel import
  const handleImport = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  
    if (!file) {
      setError('Please upload an Excel file first.');
      return;
    }
  
    setIsImporting(true); // Disable the button when importing
  
    try {
      const data = await file.arrayBuffer(); // Read file as ArrayBuffer
      const workbook = XLSX.read(data, { type: 'array' }); // Parse the ArrayBuffer as Excel
      const sheetName = workbook.SheetNames[0]; // Get the first sheet name
      const worksheet = workbook.Sheets[sheetName]; // Get the first sheet
      const jsonData: ExcelItem[] = XLSX.utils.sheet_to_json<ExcelItem>(worksheet); // Convert sheet to JSON with types
  
      // Ensure the Excel file has the expected columns and check for empty values
      const itemsToAdd = jsonData.map(item => {
        const sku = String(item?.SKU ?? '').trim(); // Ensure SKU is a string and trim any spaces
        const namaBarang = String(item?.['Nama Barang'] ?? '').trim(); // Ensure Nama Barang is a string and trim spaces
  
        if (!sku || !namaBarang) {
          // You can customize this behavior if you want to add a specific error or fallback
          return null; // Skip adding this item if SKU or Nama Barang is empty
        }
  
        return {
          sku: sku || 'Unknown SKU', // Fallback if empty
          nama_barang: namaBarang || 'Unknown Name', // Fallback if empty
          barcode_sn: `${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 7)}`, // Generate random barcodes
        };
      }).filter(item => item !== null); // Remove any null entries where SKU or Nama Barang was empty
  
      if (itemsToAdd.length === 0) {
        setError('No valid items to import. Please check the file for empty SKU or Nama Barang values.');
        return;
      }
  
      setError('');

      // Call the batch function to add items and capture the response in `addedItems`
      const addedItems = await addMasterItems(itemsToAdd); // This is the full response object

      // Check the response status code (assuming 200 for success, others for errors)
      if (addedItems.status_code === 201) {
        // If the request was successful, get the success message
        const successMessage = addedItems.message || 'Items added successfully!';
        setSuccess(successMessage); // Display success message
        // Reset input fields after successful submission
        setSku('');
        setNamaBarang('');
        setTimeout(() => {
          setSuccess(''); // Display success message
        }, 6000);
      } else {
        // If the request failed (status_code is not 200), get the error message
        setError(addedItems.message || 'An unknown error occurred.'); // Display error message
      }

      console.log('Added Items:', addedItems);
  
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error occurred while importing data.');
    } finally {
      setIsImporting(false); // Re-enable the button after import attempt
      setFile(null); // Reset the file state after import
    }
  };  
  

  return (
    <>
      <h3 className="text-lg font-bold">Tambah Barang (per-item)</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {success && <p className="text-green-600">{success}</p>}
        {error && <p className="text-red-600">{error}</p>}
        <div className="flex space-x-4"> {/* Use flexbox for two-column layout */}
          <div className="flex-1">
            <label className="label">
              <span className="label-text">SKU</span>
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Nama Barang</span>
            </label>
            <input
              type="text"
              value={nama_barang}
              onChange={(e) => setNamaBarang(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary btn-sm" 
          disabled={isSubmitting} // Disable the button when submitting
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <div className='divider divide-orange-100'></div>
        <div className='text-lg font-bold'>Import Barang dari Excel</div>
        <div className='flex justify-start'>
          <input 
            type="file" 
            className="file-input file-input-bordered file-input-sm w-full max-w-xs" 
            accept=".xlsx, .xls"
            onChange={handleFileChange} // Handle file change
          />
          <button 
            className='btn btn-success btn-sm ml-2 text-white' 
            onClick={handleImport} // Handle import
            disabled={!file || isImporting} // Disable if no file is selected or if importing
          >
            {isImporting ? "Importing..." : "Import"}
          </button>
        </div>
      </form>
    </>
  );
};

export default AddMaster;
