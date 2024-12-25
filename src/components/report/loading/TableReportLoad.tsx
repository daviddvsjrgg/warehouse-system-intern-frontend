export const LoadingTableReport = () => (
    <>
    <div className='flex justify-between mr-2 mx-2'>
    <div className="gap-4 mb-4 mt-2">
    <div className='flex'>
        <input
        type="date"
        className="input input-bordered input-sm"
        placeholder="Start Date"
        disabled
        />
        <div className='mt-1 mx-3 text-sm'>To</div>
        <input
        type="date"
        className="input input-bordered input-sm"
        placeholder="End Date"
        disabled
        />
    </div>
    </div>
    <div className='flex'>  
    <div className="max-w-md">
        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
        Search
        </label>
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
            id="default-search"
            className="block w-full input-sm p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
            placeholder="Cari sku, barcode sn, inv"
            required
            disabled
        />
    </div>
    </div>
    </div>
    </div>
    <table className="table">
    <thead>
    <tr>
        <th>Date</th>
        <th>SKU</th>
        <th>Nama Barang</th>
        <th>Invoice Number</th>
        <th>Barcode SN</th>
        <th>User</th>
        <th>Actions</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td colSpan={8} className="text-center">
        <span className="loading loading-dots loading-sm"></span>
        </td>
    </tr>
    </tbody>
    </table>

    </>
  );

export default LoadingTableReport;