import React, { useEffect, useState, useCallback } from 'react';
import { fetchScannedItems, FetchScannedItem, updateScannedItem, deleteScannedItem } from '@/api/scanned-item/scanned-item';
// import Image from 'next/image';
import { convertToJakartaTime } from '@/utils/dateUtils';
import { ExportData, GroupedItem, Item } from '@/utils/interface/excelGroupingInterface';
import useDebounce from '@/hooks/useDebounce';
import * as XLSX from 'xlsx';

const TableReport: React.FC = () => {
  const [scannedItems, setScannedItems] = useState<FetchScannedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [skuSearch, setSkuSearch] = useState<string>('');
  const [editSku, setEditSku] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReportId, setDeleteReportId] = useState<number>(0);
  const [deleteSku, setDeleteSku] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [originalQuantity, setOriginalQuantity] = useState<number>(1); // Track original quantity
  const [isSaving, setIsSaving] = useState<boolean>(false); // Track saving status
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null); // Track save success
  const [validationError, setValidationError] = useState<string | null>(null);
  const debouncedSkuSearch = useDebounce(skuSearch, 300);
  const perPage = 5;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [nextButtonClicked, setNextButtonClicked] = useState<boolean>(false);

  const getScannedItems = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchScannedItems(currentPage, perPage, debouncedSkuSearch, startDate, endDate);
      setScannedItems(items);
      setNextButtonClicked(false); // Reset next button state after fetching
    } catch (error) {
      const errorMessage = (error as Error).message || "Unknown Error";
      setError(errorMessage || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, debouncedSkuSearch, startDate, endDate]);

  useEffect(() => {
    getScannedItems();
  }, [getScannedItems]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleEdit = (id: number, sku: string, qty: number) => {
    setEditSku(sku);
    setEditId(id);
    setQuantity(qty);
    setOriginalQuantity(qty); // Set original quantity for comparison
    setSaveSuccess(null); // Reset success message
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
    setNextButtonClicked(true); // Set to true when next button is clicked
  };

  const handleSaveEditReport = async () => {
    // Validate that quantity is at least 1 and a positive integer
    if (editId === null || quantity === originalQuantity || quantity < 1 || !Number.isInteger(quantity)) {
      setValidationError("Quantity should be a positive integer of at least 1.");
      setSaveSuccess(false);
      return;
    }
  
    setIsSaving(true);
    setSaveSuccess(null);
  
    try {
      await updateScannedItem(editId, quantity);
  
      // Update the specific row in scannedItems
      setScannedItems((prevItems) =>
        prevItems.map((item) =>
          item.id === editId ? { ...item, qty: quantity } : item
        )
      );
  
      setSaveSuccess(true); // Show success message
      setOriginalQuantity(quantity); // Update original quantity
      setValidationError("");
    } catch (error) {
      console.error(error);
      setSaveSuccess(false); // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteScannedItem(deleteReportId);
      await getScannedItems()
      const modal = document.getElementById('delete_modal') as HTMLDialogElement | null;
      if (modal) {
        modal.close();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('An unknown error occurred');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportPerItem = async () => {
    try {
        const items = await fetchScannedItems(1, 10000, debouncedSkuSearch, startDate, endDate);

        // Map fetched items to export data with User field
        const exportData = items.map(item => ({
            Date: convertToJakartaTime(item.created_at),
            'Invoice Number': item.invoice_number,
            SKU: item.sku,
            'Nama Barang': item.master_item.nama_barang,
            User: item.user.name, // Format User as "Name <Email>"
            'Barcode SN': item.barcode_sn,
            Quantity: item.qty,
        }));

        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();

        // Define column widths
        const headers = [
            { wch: 20 }, // Date
            { wch: 20 }, // Invoice Number
            { wch: 15 }, // SKU
            { wch: 40 }, // Nama Barang
            { wch: 20 }, // User
            { wch: 20 }, // Barcode SN
            { wch: 10 }  // Quantity
        ];

        // Apply column widths
        worksheet['!cols'] = headers;

        // Append worksheet to workbook and export file
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Scanned Per Items');
        XLSX.writeFile(workbook, 'Scanned_Per_Items_Report.xlsx');
    } catch (error) {
        console.error('Error fetching or exporting items:', error);
    }
};


const handleExportGrouping = async (): Promise<void> => {
  try {
      const items: Item[] = await fetchScannedItems(1, 10000, debouncedSkuSearch, startDate, endDate);

      // Group items by Invoice Number and SKU/Nama Barang
      const groupedData: Record<string, GroupedItem> = items.reduce((acc, item) => {
          const invoice = item.invoice_number;

          if (!acc[invoice]) {
              acc[invoice] = {
                  Date: convertToJakartaTime(item.created_at),
                  'Invoice Number': invoice,
                  Items: [],
                  User: item.user.name,
              };
          }

          // Check if an item with the same SKU/Nama Barang already exists in the group
          const existingItem = acc[invoice].Items.find(
              i => i.SKU === item.sku && i['Nama Barang'] === item.master_item.nama_barang
          );

          if (existingItem) {
              // Append Barcode SN and add Quantity if the item already exists
              existingItem['Barcode SN'] += `, ${item.barcode_sn}`;
              existingItem.Quantity += item.qty;
          } else {
              // Add as a new item if it doesn't exist
              acc[invoice].Items.push({
                  SKU: item.sku,
                  'Nama Barang': item.master_item.nama_barang,
                  'Barcode SN': item.barcode_sn,
                  Quantity: item.qty,
              });
          }

          return acc;
      }, {} as Record<string, GroupedItem>);

      // Flatten grouped data to an array, leaving Date, Invoice Number, and User only on the first row of each group
      const exportData: ExportData[] = Object.values(groupedData).flatMap(group => {
          return group.Items.map((item, index) => ({
              Date: index === 0 ? group.Date : '',  // Only the first row includes the Date
              'Invoice Number': index === 0 ? group['Invoice Number'] : '', // Only the first row includes the Invoice Number
              User: index === 0 ? group.User : '', // Only the first row includes the User
              SKU: item.SKU,
              'Nama Barang': item['Nama Barang'],
              'Barcode SN': item['Barcode SN'],
              Quantity: item.Quantity,
          }));
      });

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData, { skipHeader: true });
      const workbook = XLSX.utils.book_new();

      // Set up headers with the specified widths
      const headers = [
          { wch: 20 }, // Date
          { wch: 20 }, // Invoice Number
          { wch: 20 }, // User
          { wch: 15 }, // SKU
          { wch: 40 }, // Nama Barang
          { wch: 20 }, // Barcode SN
          { wch: 10 }  // Quantity
      ];

      // Adding headers to the worksheet
      XLSX.utils.sheet_add_aoa(worksheet, [['Date', 'Invoice Number', 'User', 'SKU', 'Nama Barang', 'Barcode SN', 'Quantity']], { origin: 'A1' });
      XLSX.utils.sheet_add_json(worksheet, exportData, { header: ['Date', 'Invoice Number', 'User', 'SKU', 'Nama Barang', 'Barcode SN', 'Quantity'], skipHeader: true, origin: 'A2' });

      // Apply column widths
      worksheet['!cols'] = headers;
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Grouped Invoices');

      // Write the file
      XLSX.writeFile(workbook, 'Grouped_Invoices_Report.xlsx');
  } catch (error) {
      console.error('Error fetching or exporting items:', error);
  }
};
  
  return (
    <>
     {/* Modal Delete */}
     <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Yakin ingin menghapus data ini?</h3>
          <p className="py-4">{deleteSku}</p>
          <div className="flex justify-end">
            {isDeleting ? (
              <></>
            ) : (
              <button
                className="btn"
                onClick={() => {
                  const modal = document.getElementById('delete_modal') as HTMLDialogElement | null;
                  if (modal) {
                    modal.close();
                  }
                }}
              >
                Tidak
              </button>
            )}
            <button disabled={isDeleting ? true : false} onClick={handleSubmitDelete} className={`btn btn-error text-white mx-2 ${isDeleting ? "animate-pulse" : ""}`}>
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      {/* Drawer (Edit) */}
      <div className="drawer drawer-end z-10">
        <input id="edit_report" type="checkbox" className="drawer-toggle" />
        <div className="drawer-side">
          <label htmlFor="edit_report" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
            <h1 className="text-blue-700">Edit Report | {editSku}</h1>

            {/* Quantity Input */}
            <div className="my-4">
              <label htmlFor="quantity" className="text-sm font-medium mb-2 block">Quantity</label>
              <input
                type="number"
                id="quantity"
                placeholder="Enter quantity"
                className="input input-bordered w-3/4"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>

            <div className="">
              <label htmlFor="edit_report" className="btn btn-ghost btn-sm">Cancel</label>
              <button
                className="btn btn-primary btn-sm mx-2"
                onClick={handleSaveEditReport}
                disabled={quantity === originalQuantity || isSaving} // Disable button if unchanged or saving
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Success/Error Message */}
            {saveSuccess !== null && (
              <div className={`mt-4 text-sm ${saveSuccess ? 'text-green-500' : 'text-red-500'}`}>
                {saveSuccess ? 'Saved successfully!' : 'Failed to save changes'}
              </div>
            )}
            {validationError && <div className="text-red-500">{validationError}</div>}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* Filter Inputs */}
        <div className='flex justify-between mr-2 mx-2'>
            <div className="gap-4 mb-4 mt-2">
              <div className='flex'>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input input-bordered input-sm"
                  placeholder="Start Date"
                />
                <div className='mt-1 mx-3 text-sm'>To</div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input input-bordered input-sm"
                  placeholder="End Date"
                />
              </div>
            </div>
            <div className='flex'>
              <div className="dropdown mr-2">
                  <div tabIndex={0} role="button" className="btn btn-success btn-sm text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 48 48">
                      <path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"></path><path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"></path><path fill="#2E7D32" d="M27 42L6 38 6 10 27 6z"></path><path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"></path>
                    </svg>
                    Export Excel
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                    <li><a onClick={handleExportPerItem}>Export Per-item</a></li>
                    <li><a onClick={handleExportGrouping}>Export Grouping</a></li>
                  </ul>
              </div>
              <div className="max-w-md">
                <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
                  Search
                </label>
                {error && <div className="text-red-500">{error}</div>}
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={skuSearch}
                    onChange={(e) => setSkuSearch(e.target.value)}
                    id="default-search"
                    className="block w-full input-sm p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                    placeholder="Cari sku, barcode sn, inv"
                    required
                  />
              </div>
            </div>
          </div>
        </div>
        <table className="table">
          {/* Table Head */}
          <thead>
            <tr>
              <th>Date</th>
              <th>SKU</th>
              <th>User</th>
              <th>Invoice Number</th>
              <th>Nama Barang</th>
              <th>Qty</th>
              <th>Barcode SN</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center">
                  <span className="loading loading-dots loading-sm"></span>
                </td>
              </tr>
            ) : (
              scannedItems.map((item) => (
                <tr key={item.id} className={`hover:bg-base-200 dark:hover:bg-gray-700"`}>
                  <td>{convertToJakartaTime(item.created_at)}</td>
                  <td>{item.sku}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      {/* <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <Image
                            src="https://img.daisyui.com/images/profile/demo/2@94.webp"
                            alt="User Avatar"
                            width={94}
                            height={94}
                            layout="fixed"
                            priority={true}
                          />
                        </div>
                      </div> */}
                      <div>
                        <div className="font-bold">{item.user.name}</div>
                        <div className="text-sm opacity-50">{item.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{item.invoice_number}</td>
                  <td>{item.master_item.nama_barang}</td>
                  <td>{item.qty}</td>
                  <td>{item.barcode_sn}</td>
                  <th>
                    <label htmlFor="edit_report" className="btn btn-ghost btn-xs text-blue-500" onClick={() => handleEdit(item.id, item.sku, item.qty)}>
                      Edit
                    </label>
                    <button
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={() => {
                        const modal = document.getElementById('delete_modal') as HTMLDialogElement | null;
                        if (modal) {
                          modal.showModal();
                        }
                        setDeleteReportId(item.id);
                        setDeleteSku(item.sku);
                      }}
                    >
                      Delete
                    </button>
                  </th>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className='flex justify-between'>
          <span className='mt-3'>Page {currentPage}</span>
          <div className="mt-4">
            <button 
              className="btn" 
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button 
              className="btn mx-2" 
              onClick={handleNextPage} 
              disabled={scannedItems.length < perPage || nextButtonClicked}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableReport;
