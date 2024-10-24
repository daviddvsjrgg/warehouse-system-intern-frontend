import React, { useEffect, useState, useCallback } from 'react';
import { fetchScannedItems, FetchScannedItem } from '@/api/scanned-item/scanned-item';
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
  const debouncedSkuSearch = useDebounce(skuSearch, 500);
  const perPage = 5;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [nextButtonClicked, setNextButtonClicked] = useState<boolean>(false); // Track next button click

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

  const handleEdit = (id: number) => {
    console.log(`Edit item with id: ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Delete item with id: ${id}`);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
    setNextButtonClicked(true); // Set to true when next button is clicked
  };

  return (
    <div className="overflow-x-auto">
      {/* Filter Inputs */}
      <div className='flex justify-between mt-2 mr-2'>
        <div className="gap-4 mb-4 mt-2">
          <div className='flex'>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input input-bordered"
              placeholder="Start Date"
            />
            <div className='mt-3 mx-3 text-sm'>To</div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input input-bordered"
              placeholder="End Date"
            />
          </div>
        </div>
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
              <tr key={item.id}>
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
  );
};

export default TableReport;
