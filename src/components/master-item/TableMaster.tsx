"use client"

import React, { useEffect, useState } from 'react';
import { deleteMasterItem, fetchMasterItems, Item, PaginatedResponse } from '@/api/master-item/master-item'; // Ensure this path is correct
import useDebounce from '@/hooks/useDebounce';
import * as XLSX from 'xlsx'; // Import SheetJS
import AddMaster from './AddMaster';

const Table: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPageChanging, setIsPageChanging] = useState<boolean>(false);
  const [idMasterItem, setIdMasterItem] = useState<number>(0);
  const [namaBarang, setNamaBarang] = useState<string | null>(null);
  const [sku, setSku] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Export to Excel Interface
  interface MasterItem {
    sku: string;
    nama_barang: string;
  }  

  const loadMasterItems = async (page: number, query: string = '', perPage: number = 5) => {
    setLoading(true);
    setError(null);

    try {
      // Adjust the perPage parameter
      const response: PaginatedResponse = await fetchMasterItems(page, query, perPage);
      if (response.success) {
        setItems(response.data.data);
        setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
        setTotalItems(response.data.total);
        setPerPage(response.data.per_page);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Unexpected error occurred');
      }
    } finally {
      setLoading(false);
      setIsPageChanging(false);
    }
  };

  // Set the debounce delay in milliseconds
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 700);

  useEffect(() => {
    loadMasterItems(currentPage, debouncedSearchQuery); // Load items with search query
  }, [currentPage, debouncedSearchQuery]); // Depend on search query as well

   // This effect can be used to trigger a search or API call when the debounced value changes
   useEffect(() => {
       // Early return if debounced search query is empty
       if (!debouncedSearchQuery) {
           return; // Exit the effect if the search query is empty
       }

       // Your API call or search logic here
       console.log("Searching for:", debouncedSearchQuery);
       // Add your API call or search logic here...

   }, [debouncedSearchQuery]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= lastPage) {
      setIsPageChanging(true);
      setCurrentPage(page);
    }
  };

  // Handle item deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMasterItem(idMasterItem);
      await loadMasterItems(currentPage, searchQuery); // Reload current page with search query
      const modal = document.getElementById('delete_modal') as HTMLDialogElement | null;
      if (modal) {
        modal.close();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setServerError(true);
      } else {
        console.error('An unknown error occurred');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response: PaginatedResponse = await fetchMasterItems(1, '', 10000); // Fetch all data (up to 10,000 items)
      
      if (response.success) {
        // Ensure items are typed correctly
        const items: MasterItem[] = response.data.data; // Full data as MasterItem[]

        // Map to only include `sku` and `nama_barang`
        const filteredItems = items.map((item: MasterItem) => ({
          SKU: item.sku,
          'Nama Barang': item.nama_barang,
        }));

        // Prepare data for Excel
        const worksheet = XLSX.utils.json_to_sheet(filteredItems); // Convert filtered data to sheet format
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'MasterItems');

        // Create Excel file and trigger download
        XLSX.writeFile(workbook, 'Master_Item.xlsx');
      } else {
        throw new Error('Failed to export data.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getPaginationItems = (current: number, last: number) => {
    const delta = 1;
    const range = [];

    range.push(1);

    if (current - delta > 2) {
      range.push('...');
    }

    for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
      range.push(i);
    }

    if (current + delta < last - 1) {
      range.push('...');
    }

    if (last > 1) {
      range.push(last);
    }

    return range;
  };

  const paginationItems = getPaginationItems(currentPage, lastPage);

  const startItemIndex = (currentPage - 1) * perPage + 1;
  const endItemIndex = Math.min(currentPage * perPage, totalItems);

  return (
    <>
      {/* Modal Delete */}
      <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Yakin ingin menghapus data ini?</h3>
          {serverError && (
            <>
              <p className='text-red-500'>Tidak bisa dihapus, item ini telah di scan</p>
            </>
          )}
          <p className="py-4">{sku} | {namaBarang}</p>
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
            <button disabled={isDeleting ? true : false} onClick={handleDelete} className={`btn btn-error text-white mx-2 ${isDeleting ? "animate-pulse" : ""}`}>
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      {/* Modal Add Master */}
      <input type="checkbox" id="AddMaster" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <AddMaster />
        </div>
        <label className="modal-backdrop" htmlFor="AddMaster">Close</label>
      </div>
      <div className="overflow-x-auto">

        <div className='flex justify-between'>
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
                type="search"
                id="default-search"
                className="block w-full p-4 ps-10 text-sm input-md text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                placeholder="Cari sku, nama barang"
                required
                value={searchQuery} // Bind searchQuery to input value
                onChange={(e) => {
                  setSearchQuery(e.target.value); // Update state on input change
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
          </div>
          <div className='flex mt-4 mx-2'>
          <label htmlFor="AddMaster" className="btn btn-primary btn-sm">+ Tambah Barang</label>
          <button className="btn btn-sm mx-2 btn-success text-white" onClick={handleExportExcel}>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 48 48">
              <path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"></path><path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"></path><path fill="#2E7D32" d="M27 42L6 38 6 10 27 6z"></path><path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"></path>
            </svg>
            Export Excel
          </button>
            <div className="">
                <svg onClick={() => {
                  setLoading(true); // Optionally show a loading indicator on refresh
                  loadMasterItems(currentPage, searchQuery); // Trigger a data reload
                }}  xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 30 30" className={`cursor-pointer ${!loading ? 'hover:bg-gray-200 hover:rounded-xl' : ''} ${loading ? 'animate-spin' : ''}`}>
                  <path d="M 15 3 C 12.031398 3 9.3028202 4.0834384 7.2070312 5.875 A 1.0001 1.0001 0 1 0 8.5058594 7.3945312 C 10.25407 5.9000929 12.516602 5 15 5 C 20.19656 5 24.450989 8.9379267 24.951172 14 L 22 14 L 26 20 L 30 14 L 26.949219 14 C 26.437925 7.8516588 21.277839 3 15 3 z M 4 10 L 0 16 L 3.0507812 16 C 3.562075 22.148341 8.7221607 27 15 27 C 17.968602 27 20.69718 25.916562 22.792969 24.125 A 1.0001 1.0001 0 1 0 21.494141 22.605469 C 19.74593 24.099907 17.483398 25 15 25 C 9.80344 25 5.5490109 21.062074 5.0488281 16 L 8 16 L 4 10 z"></path>
                </svg>
            </div>
          </div>
        </div>

        <table className="table table-xl">
          <thead className="bg-base-200">
            <tr>
              <th>SKU</th>
              <th>Nama Barang</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <tr>
                  <td colSpan={3} className="text-center">
                    <span className="loading loading-dots loading-sm"></span>
                  </td>
                </tr>
              </>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td>{item.sku}</td>
                  <td>{item.nama_barang}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={() => {
                        const modal = document.getElementById('delete_modal') as HTMLDialogElement | null;
                        if (modal) {
                          modal.showModal();
                        }
                        setIdMasterItem(item.id);
                        setSku(item.sku);
                        setNamaBarang(item.nama_barang);
                        setServerError(false);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between mt-3">
          <span className="text-sm text-gray-700 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{startItemIndex}</span> to{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{endItemIndex}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> Entries
          </span>
          <nav aria-label="Page navigation example">
            <ul className="inline-flex -space-x-px text-base h-10">
              <li>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading || isPageChanging}
                  className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Prev
                </button>
              </li>
              {paginationItems.map((page, index) =>
                typeof page === 'number' ? (
                  <li key={index}>
                    <button
                      onClick={() => handlePageChange(page)}
                      disabled={currentPage === page || loading || isPageChanging}
                      className={`flex items-center justify-center px-4 h-10 leading-tight border border-e-0 border-gray-300  ${
                        currentPage === page
                          ? 'z-10 text-gray-900 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white'
                          : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  </li>
                ) : (
                  <li key={index}>
                    <span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                      ...
                    </span>
                  </li>
                )
              )}
              <li>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === lastPage || loading || isPageChanging}
                  className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Table;
