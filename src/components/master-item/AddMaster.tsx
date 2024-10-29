"use client";

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

    // Prepare the new item to be added
    const newItem = {
      sku,
      nama_barang,
      barcode_sn : Math.random().toString(36).substring(2, 7)
    };

    try {
      // Create an array for batch submission
      const itemsToAdd = [newItem];

      const addedItems = await addMasterItems(itemsToAdd); // Call the batch function

      setSuccess('Item(s) added successfully! Please refresh the table if necessary.');
      setTimeout(() => {
        setSuccess('');
      }, 6000);

      console.log('Added Items:', addedItems);
      
      // Reset input fields after successful submission
      setSku('');
      setNamaBarang('');
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
  
      // Ensure the Excel file has the expected columns
      const itemsToAdd = jsonData.map(item => ({
        sku: item?.SKU ?? 'Unknown SKU', // Optional chaining and fallback
        nama_barang: item?.['Nama Barang'] ?? 'Unknown Name', // Optional chaining and fallback
        barcode_sn: Math.random().toString(36).substring(2, 7), // Generate random barcodes
      }));
  
      await addMasterItems(itemsToAdd); // Add items to the master list
  
      setSuccess('Item(s) added successfully! Please refresh the table if necessary.');
      setTimeout(() => setSuccess(''), 6000); // Clear success message after 6 seconds
  
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error occurred while importing data.');
    } finally {
      setIsImporting(false); // Re-enable the button after import attempt
      setFile(null); // Reset the file state after import
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <p className="text-green-600">{success}</p>}
      <div className="flex space-x-4"> {/* Use flexbox for two-column layout */}
        <div className="flex-1">
          <label className="block text-sm font-medium">SKU:</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Nama Barang:</label>
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
      <p>Import dari Excel</p> 
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
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
};

export default AddMaster;
