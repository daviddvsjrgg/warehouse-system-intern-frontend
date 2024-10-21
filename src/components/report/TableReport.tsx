import React, { useEffect, useState } from 'react';
import { fetchScannedItems, FetchScannedItem } from '@/api/scanned-item/scanned-item'; // Import your fetch function

const TableReport: React.FC = () => {
  const [scannedItems, setScannedItems] = useState<FetchScannedItem[]>([]); // State for scanned items
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch scanned items on component mount
  useEffect(() => {
    const getScannedItems = async () => {
      try {
        const items = await fetchScannedItems(1); // Fetch items from page 1
        setScannedItems(items); // Set the fetched items in state
      } catch (err: any) {
        setError(err.message || 'Failed to load data'); // Set error if any
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    getScannedItems();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error message
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* Table Head */}
        <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th>
            <th>SKU</th>
            <th>User</th>
            <th>Invoice Number</th>
            <th>Nama Barang</th>
            <th>Qty</th>
            <th>Barcode SN</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Dynamically render rows based on fetched data */}
          {scannedItems.map((item) => (
            <tr key={item.id}>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <td>{item.sku}</td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle h-12 w-12">
                      <img
                        src="https://img.daisyui.com/images/profile/demo/2@94.webp" // Example avatar
                        alt="User Avatar"
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
              <td>{new Date(item.created_at).toLocaleDateString()}</td>
              <th>
                <button className="btn btn-ghost btn-xs text-blue-500">details</button>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableReport;
