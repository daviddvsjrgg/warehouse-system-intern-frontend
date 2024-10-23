import React, { useEffect, useState, useCallback } from 'react';
import { fetchScannedItems, FetchScannedItem } from '@/api/scanned-item/scanned-item';
import Image from 'next/image';
import { convertToJakartaTime } from '@/utils/dateUtils';
import useDebounce from '@/hooks/useDebounce';

const TableReport: React.FC = () => {
  const [scannedItems, setScannedItems] = useState<FetchScannedItem[]>([]); // State for scanned items
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [startDate, setStartDate] = useState<string>(''); // State for start date
  const [endDate, setEndDate] = useState<string>(''); // State for end date
  const [skuSearch, setSkuSearch] = useState<string>(''); // State for SKU search term
  const debouncedSkuSearch = useDebounce(skuSearch, 500); // Debounced search term with 500ms delay
  const perPage = 5; // Fixed number of items per page
  const [currentPage, setCurrentPage] = useState<number>(1); // State for current page

  const getScannedItems = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const items = await fetchScannedItems(currentPage, perPage, debouncedSkuSearch, startDate, endDate); // Fetch with debounced SKU search
      setScannedItems(items); // Set the fetched items in state
    } catch (error) {
      const errorMessage = (error as Error).message || "Unknown Error";
      setError(errorMessage || 'Failed to load data'); // Set error if any
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  }, [currentPage, perPage, debouncedSkuSearch, startDate, endDate]);

  useEffect(() => {
    getScannedItems(); // Fetch items whenever search/filter changes
  }, [getScannedItems]);

  if (error) {
    return <div>Error: {error}</div>; // Show error message
  }

  const handleEdit = (id: number) => {
    // Implement edit logic here
    console.log(`Edit item with id: ${id}`);
  };

  const handleDelete = (id: number) => {
    // Implement delete logic here
    console.log(`Delete item with id: ${id}`);
  };

  return (
    <div className="overflow-x-auto">
      {/* Filter Inputs */}
      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input input-bordered"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="input input-bordered"
          placeholder="End Date"
        />
        <input
          type="text"
          value={skuSearch}
          onChange={(e) => setSkuSearch(e.target.value)}
          className="input input-bordered"
          placeholder="Search by SKU"
        />
      </div>
      <table className="table">
        {/* Table Head */}
        <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th>
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
              <td colSpan={9} className="text-center">
                <span className="loading loading-dots loading-sm"></span>
              </td>
            </tr>
          ) : (
            scannedItems.map((item) => (
              <tr key={item.id}>
                <th>
                  <label>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </th>
                <td>{convertToJakartaTime(item.created_at)}</td>
                <td>{item.sku}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <Image
                          src="https://img.daisyui.com/images/profile/demo/2@94.webp" // Example avatar
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
                  <button className="btn btn-ghost btn-xs text-blue-500" onClick={() => handleEdit(item.id)}>Edit</button>
                  <button className="btn btn-ghost btn-xs text-red-500 ml-2" onClick={() => handleDelete(item.id)}>Delete</button>
                </th>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button 
          className="btn" 
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button 
          className="btn" 
          onClick={() => setCurrentPage((prev) => prev + 1)} 
          disabled={scannedItems.length < perPage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableReport;
