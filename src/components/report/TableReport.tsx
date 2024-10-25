import React, { useEffect, useState, useCallback } from 'react';
import { fetchScannedItems, FetchScannedItem, updateScannedItem, deleteScannedItem } from '@/api/scanned-item/scanned-item';
import Image from 'next/image';
import { convertToJakartaTime } from '@/utils/dateUtils';
import useDebounce from '@/hooks/useDebounce';

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
        <div className='flex justify-between mt-2 mr-2 mx-2'>
          <div className="gap-4 mb-4 mt-2">
            <div className='flex'>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input input-bordered input-md"
                placeholder="Start Date"
              />
              <div className='mt-3 mx-3 text-sm'>To</div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input input-bordered input-md"
                placeholder="End Date"
              />
            </div>
          </div>
            <div className="max-w-md mb-3">
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
                  className="block w-full input-md p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  placeholder="Cari sku"
                  required
                />
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
                <tr key={item.id} className={`hover:bg-base-200`}>
                  <td>{convertToJakartaTime(item.created_at)}</td>
                  <td>{item.sku}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
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
                      </div>
                      <div>
                        <div className="font-bold">{item.user.name}</div>
                        <div className="text-sm opacity-50">{item.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{item.invoice_number}</td>
                  <td>{item.master_item.nama_barang}</td>
                  <td>{item.qty}</td>
                  <td>{item.master_item.barcode_sn}</td>
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
