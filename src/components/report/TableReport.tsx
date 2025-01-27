/* eslint-disable */ 
import React, { useEffect, useState, useCallback } from 'react';
import { fetchScannedItems, FetchScannedItem, updateScannedItemSN, updateScannedItemInvoice, deleteScannedItem, getTotalItemScannedItems, updateScannedItemAllInvoice } from '@/api/scanned-item/scanned-item';
import { convertToJakartaTime } from '@/utils/dateUtils';
import { ExportData, GroupedItem, Item } from '@/types/excelGroupingInterface';
import useDebounce from '@/hooks/useDebounce';
import * as XLSX from 'xlsx';
import { fetchRolesPermissions } from '@/api/user-management/roles';
import { FeatureDisabled } from '@/components/alerts/feature-disabled';
import EditIcon from '@/app/icon/EditIcon';
import fetchInvoiceByNumber from '@/api/invoice/invoice';
import AddScannedByInvoice from '@/components/report/AddScannedByInvoice';


const TableReport: React.FC = () => {
  const [scannedItems, setScannedItems] = useState<FetchScannedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messageSaveAllInvoice, setMessageSaveAllInvoice] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [skuSearch, setSkuSearch] = useState<string>('');
  const [editSku, setEditSku] = useState<string>('');
  const [editInvoice, setEditInvoice] = useState<string>('');
  const [editTempInvoice, setEditTempInvoice] = useState<string>('');
  const [editOriginalInvoice, setEditOriginalInvoice] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReportId, setDeleteReportId] = useState<number>(0);
  const [deleteSku, setDeleteSku] = useState<string | null>(null);
  const [deleteBarcodeSN, setDeleteBarcodeSN] = useState<string | null>(null);
  const [deleteNamaBarang, setDeleteNamaBarang] = useState<string | null>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [originalQuantity, setOriginalQuantity] = useState<number>(1); // Track original quantity
  const [isSaving, setIsSaving] = useState<boolean>(false); // Track saving status
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null); // Track save success
  const [validationError, setValidationError] = useState<string | null>(null);
  const debouncedSkuSearch = useDebounce(skuSearch, 300);
  const perPageValueOptions = [5, 10, 25, 50, 100, 500]; // "All" represented as a very large number
  const [perPage, setPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [nextButtonClicked, setNextButtonClicked] = useState<boolean>(false);
  const [barcodeSn, setBarcodeSn] = useState('');
  const [originalBarcodeSn, setOriginalBarcodeSn] = useState<string>(''); // Track original barcode value
  const [namaBarang, setNamaBarang] = useState<string>('');
  const [totalItem, setTotalItem] = useState<number>(0);
  const [perPageisOpen, setPerPageIsOpen] = useState(false);
  const [checkDuplicate, setCheckDuplicate] = useState(false);
  const [searchFilterisOpen, setSearchFilterIsOpen] = useState(false); // Dropdown visibility
  const [selectedFilter, setSelectedFilter] = useState<string>('Semua'); // Selected option
  const [isExactSearch, setIsExactSearch] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any | null>(null);
  const [invoiceDataPreview, setInvoiceDataPreview] = useState<any | null>(null);
  const [isEditingLoading, setIsEditingLoading] = useState(false);
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [yakinEditAllInvoiceButton, setYakinEditAllInvoiceButton] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");
  const [editAllInvoice, setEditAllInvoice] = useState(false);
  const [alreadyCheckAllInvoice, setAlreadyCheckAllInvoice] = useState(false);
  const [successMessageEditAllInvoice, setSuccessMessageEditAllInvoice] = useState('');
  

  const refreshTableData = async () => {
    try {
      setIsRefreshLoading(true); // Start loading state
      const response = await fetchInvoiceByNumber(editInvoice);
      if (response && response.success) {
        setInvoiceData(response.data.data[0]); // Assuming single invoice
      } else {
        setError('Failed to fetch invoice data.');
      }
    } catch (error) {
      setError('An unexpected error occurred.');
    } finally {
      setIsRefreshLoading(false); // Stop loading state
    }
  };

  // Permission =================================================================
  const [hasUpdatePermission, setHasUpdatePermission] = useState(false);
  const [hasReadPermission, setHasReadPermission] = useState(false);
  const [hasExportPermission, setHasExportPermission] = useState(false);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);

  const [rolesFetched, setRolesFetched] = useState(false); // State to indicate roles fetching completion
  


  const toggleDropdownSearchFilter = () => setSearchFilterIsOpen(!searchFilterisOpen);

  const handleChange = (value: string) => {
    setSelectedFilter(value); // Update the selected option
  };

  const toggleExactSearch = () => {
    setIsExactSearch(!isExactSearch);
  };
  
  const getScannedItems = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchScannedItems(currentPage, perPage, debouncedSkuSearch, startDate, endDate, checkDuplicate, isExactSearch, selectedFilter);
      const totalData = await getTotalItemScannedItems(currentPage, perPage, debouncedSkuSearch, startDate, endDate, checkDuplicate, isExactSearch, selectedFilter);
      setTotalItem(totalData.total);
      setScannedItems(items);
      setNextButtonClicked(false); // Reset next button state after fetching
    } catch (error) {
      const errorMessage = (error as Error).message || "Unknown Error";
      setError(errorMessage || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, debouncedSkuSearch, startDate, endDate, checkDuplicate, selectedFilter, isExactSearch, yakinEditAllInvoiceButton]);

  // Effect to handle search and change perPage value
  useEffect(() => {
    if (skuSearch.trim() !== '') {
        setCurrentPage(1);
      } else {
        // Reset
        setPerPage(5);
        setCurrentPage(1);
    }
  }, [skuSearch]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesResponse = await fetchRolesPermissions(1, 'office');
        const roles = rolesResponse.data.data;

        // Iterate through roles to check each permission
        roles.forEach((role: any) => {
          const permissions = role.permissions; // Assuming `permissions` is an array inside each role

          // Check for specific permissions and set states accordingly
          if (permissions.some((perm: any) => perm.name === 'update')) {
            setHasUpdatePermission(true);
          }
          if (permissions.some((perm: any) => perm.name === 'read')) {
            setHasReadPermission(true);
          }
          if (permissions.some((perm: any) => perm.name === 'export')) {
            setHasExportPermission(true);
          }
          if (permissions.some((perm: any) => perm.name === 'delete')) {
            setHasDeletePermission(true);
          }
        });

        // Mark roles as fetched
        setRolesFetched(true);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };

    fetchRoles();
  }, []);

useEffect(() => {
  if (rolesFetched) {
    getScannedItems();
  }
}, [rolesFetched, getScannedItems]);

  

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleEdit = async (id: number, sku: string, qty: number, barcode: string, nama_barang: string, invoice_number: string) => {
    setAlreadyCheckAllInvoice(false);
    setEditAllInvoice(false);
    setMessageSaveAllInvoice('Note: Invoice baru akan dibuat jika belum ada, jika ada maka akan digabungkan.');
    setInvoiceDataPreview([]);
    setNamaBarang(nama_barang);
    setEditSku(sku);
    setEditId(id);
    setQuantity(qty);
    setBarcodeSn(barcode);
    setEditInvoice(invoice_number);
    setEditTempInvoice(invoice_number);
    setSaveSuccess(null); // Reset success message
    setValidationError(null);
    // Open the modal
    const modal = document.getElementById(
      'edit_invoice_modal'
    ) as HTMLDialogElement | null;
    if (modal) modal.showModal();

    setIsEditingLoading(true); // Start loading state
    try {
      const response = await fetchInvoiceByNumber(invoice_number);
      if (response && response.success) {
        setInvoiceData(response.data.data[0]); // Assuming single invoice
      } else {
        setError('Failed to fetch invoice data.');
      }
    } catch (err) {
      setError('Error fetching invoice data.');
    } finally {
      setIsEditingLoading(false); // End loading state
    }
  };

  const handleEditBarcodeSN = (id: number, sku: string, qty: number, barcode: string, nama_barang: string) => {
    setNamaBarang(nama_barang);
    setEditSku(sku);
    setEditId(id);
    setQuantity(qty);
    setOriginalQuantity(qty); // Set original quantity for comparison
    setBarcodeSn(barcode);
    setOriginalBarcodeSn(barcode); // Set original barcode for comparison
    setSaveSuccess(null); // Reset success message
    setValidationError(null);
  };

  const handleEditInvoice = (id: number, sku: string, qty: number, barcode: string, nama_barang: string, invoice_number: string) => {
    setNamaBarang(nama_barang);
    setEditSku(sku);
    setEditId(id);
    setQuantity(qty);
    setOriginalQuantity(qty); // Set original quantity for comparison
    setBarcodeSn(barcode);
    setOriginalBarcodeSn(barcode); // Set original barcode for comparison
    setEditInvoice(invoice_number)
    setEditOriginalInvoice(invoice_number)
    setSaveSuccess(null); // Reset success message
    setValidationError(null);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
    setNextButtonClicked(true); // Set to true when next button is clicked
  };

  const handleSaveEditBarcodeSN = async () => {
    // Validate inputs
    if (
        editId === null || 
        (quantity === originalQuantity && barcodeSn === originalBarcodeSn) || 
        quantity < 1 || 
        !Number.isInteger(quantity)
    ) {
        setValidationError("Ensure all fields are correctly updated and valid.");
        setSaveSuccess(false);
        return;
    }

    setIsSaving(true);
    setSaveSuccess(null);

    try {
        // Fetch existing items to check for duplicate barcode_sn
        const existingItems = await fetchScannedItems(1, 5, barcodeSn); // Adjust the limit if necessary
        const isBarcodeDuplicate = existingItems.some(
            (item) => 
                item.barcode_sn.toLowerCase() === barcodeSn.toLowerCase() && 
                item.id !== editId // Ensure we don't compare with the current item
        );

        if (isBarcodeDuplicate) {
            setValidationError("The barcode sn already in use");
            setSaveSuccess(false);
            setIsSaving(false); // Stop the saving process
            return;
        }

        // Proceed with saving if no duplicates are found
        await updateScannedItemSN(editId, quantity, barcodeSn);

        // Update the specific item in the list
        setScannedItems((prevItems) =>
            prevItems.map((item) =>
                item.id === editId ? { ...item, qty: quantity, barcode_sn: barcodeSn } : item
            )
        );

        setSaveSuccess(true); // Show success message
        setOriginalQuantity(quantity); // Update original values
        setOriginalBarcodeSn(barcodeSn);
        setValidationError('');
    } catch (error) {
        console.error(error);
        setSaveSuccess(false); // Show error message
    } finally {
        setIsSaving(false);
    }
};

  const handleSaveEditInvoice = async () => {
    // Validate inputs
    if (
        editId === null) {
        setValidationError("Ensure all fields are correctly updated and valid.");
        setSaveSuccess(false);
        return;
    }

    setIsSaving(true);
    setSaveSuccess(null);

    try {
        // Proceed with saving if no duplicates are found
        await updateScannedItemInvoice(editId, editInvoice);

        // Update the specific item in the list
        setScannedItems((prevItems) =>
            prevItems.map((item) =>
                item.id === editId ? { ...item, invoice_number: editInvoice } : item
            )
        );

        setSaveSuccess(true); // Show success message
        setOriginalQuantity(quantity); // Update original values
        setEditOriginalInvoice(editInvoice);
        setValidationError('');
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
        const items = await fetchScannedItems(1, 100000, debouncedSkuSearch, startDate, endDate);

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

 const handlePerPageChange = (value: number) => {
    setPerPage(value);
    console.log(`Items per page: ${value}`);
    // Add logic here to handle perPage change, such as fetching data
  };

  const handleCheckEditAllInvoice = async () => {
    try {
      setIsRefreshLoading(true); // Start loading state

      // Check if the invoice exists
      const checkResponse = await fetchInvoiceByNumber(editTempInvoice);
      if (
        !checkResponse || 
        !checkResponse.success || 
        !checkResponse.data || 
        checkResponse.data.data.length === 0 // Accessing the `data` array inside `data`
      ) {
        // Case when the invoice does not exist
        setInvoiceDataPreview([]);
        setMessageSaveAllInvoice('Invoice belum ada. Yakin ingin mengubah? ' + editInvoice + " akan berubah ke: " + editTempInvoice);

        setAlreadyCheckAllInvoice(true)
        return; // Exit early
      } else {
        // Case when the invoice exists
        setMessageSaveAllInvoice('Invoice sudah ada. Yakin ingin menggabungkan? ' + editInvoice + ' akan digabungkan ke: ' + editTempInvoice + '.');
        const response = await fetchInvoiceByNumber(editTempInvoice);
        if (response && response.success) {
          setInvoiceDataPreview(response.data.data[0]); // Assuming a single invoice
        } else {
          setMessageSaveAllInvoice('Failed to fetch invoice data.');
        }

        setAlreadyCheckAllInvoice(true)
        return; // Exit early
      }

    } catch (error) {
      setMessageSaveAllInvoice('An unexpected error occurred.');
    } finally {
      setIsRefreshLoading(false);
    }
  };

  const handleYakinEditAllInvoice = async () => {
    try {
      setIsRefreshLoading(true); // Start loading state
      setYakinEditAllInvoiceButton(true);

      // Update the scanned item for all invoices
      await updateScannedItemAllInvoice(editInvoice, editTempInvoice);
      const response = await fetchInvoiceByNumber(editTempInvoice);
        if (response && response.success) {
          setInvoiceData(response.data.data[0]); // Assuming a single invoice
        } else {
          setMessageSaveAllInvoice('Failed to fetch invoice data.');
        }
    } catch (error) {
      setMessageSaveAllInvoice('An unexpected error occurred.');
    } finally {
      setIsRefreshLoading(false);
      setYakinEditAllInvoiceButton(false);
      setEditInvoice(editTempInvoice); 
      setAlreadyCheckAllInvoice(false);
      setMessageSaveAllInvoice('Note: Invoice baru akan dibuat jika belum ada, jika ada maka akan digabungkan.');
      setInvoiceDataPreview({});
      setEditAllInvoice(false);
      setSuccessMessageEditAllInvoice("Invoice berhasil diubah.")
      setTimeout(() => {
        setSuccessMessageEditAllInvoice("")
      }, 6000);
    }
  }



  const toggleDropdownPerPage = () => {
    setPerPageIsOpen(!perPageisOpen);
  };
  
  return (
    <>
      {/* Modal Delete */}
      <dialog id="delete_modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Yakin ingin menghapus data Scan ini?</h3>
            <p className="mt-2">Invoice: {deleteInvoice}</p>
            <p className="">Barcode SN: {deleteBarcodeSN}</p>
            <p className="mt-3">SKU: {deleteSku}</p>
            <p className="">Nama Barang: {deleteNamaBarang}</p>
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
        {/* Modal Edit Invoice */}
        <dialog id="edit_invoice_modal" className="modal">
          <div className="modal-box max-w-5xl">
            <h3 className="font-bold text-lg">Invoice: {editInvoice}</h3>
            {isEditingLoading ? (
              <span className="loading loading-dots loading-sm"></span>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : invoiceData ? (
              <>
                <p className="-mt-1 text-gray-500">{convertToJakartaTime(invoiceData.created_at)}</p>
                <div className="mt-5">
                  <div role="tablist" className="tabs tabs-lifted">
                    {/* Tab 1 */}
                    <input
                      type="radio"
                      name="my_tabs_2"
                      role="tab"
                      className={`tab ${
                        activeTab === "tab1"
                          ? "tab-active text-white [--tab-bg:blue] [--tab-border-color:blue-dark] dark:[--tab-bg:blue-dark]"
                          : ""
                      }`}
                      aria-label="Ubah Invoice Semua Barang"
                      onClick={() => setActiveTab("tab1")}
                    />
                    <div
                      role="tabpanel"
                      className={`tab-content bg-base-100 border-base-300 rounded-box p-6 ${
                        activeTab === "tab1" ? "block" : "hidden"
                      }`}
                    >
                      <span className="text-yellow-600">
                        Warning:
                      </span>
                      <span className="text-yellow-500 ml-1">
                         Semua 'SN' akan terubah dengan 'Invoice' ini.
                      </span>
                      <div className="flex justify-end gap-2 mt-4">
                       <input
                        type="text"
                        className="input input-md input-bordered w-full"
                        value={editTempInvoice}
                        disabled={!editAllInvoice}
                        onChange={(e) => {
                          setEditTempInvoice(e.target.value)
                          setAlreadyCheckAllInvoice(false);
                        }}
                      />
                        {editAllInvoice ? (
                          <>
                            <button onClick={() => {
                              setEditTempInvoice(editInvoice)
                              setEditAllInvoice(false)
                              setMessageSaveAllInvoice('Note: Invoice baru akan dibuat jika belum ada, jika ada maka akan digabungkan.');
                              setInvoiceDataPreview([])
                              }} className="btn btn-md btn-error text-white">
                              Batalkan
                            </button>
                            <button onClick={handleCheckEditAllInvoice} className="btn btn-md btn-success text-white" disabled={editTempInvoice === editInvoice}>
                              Cek
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditAllInvoice(true)} className="btn btn-md btn-primary text-white">
                              Ubah
                            </button>
                          </>
                        )}
                      </div>
                      {invoiceDataPreview?.items?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="table w-full">
                            <thead>
                            <tr>
                              <th className="w-[50px]">No</th>
                              <th className="w-[100px]">Nama Barang</th>
                              <th className="w-[50px]">SKU</th>
                              <th className="w-[50px]">Quantity</th>
                              <th className="w-[50px]">Barcode SN</th> {/* Adjust width here */}
                            </tr>
                            </thead>
                            <tbody>
                              {invoiceDataPreview.items.map((item: any, idx: any) => (
                                <tr key={idx} className="hover:bg-base-200">
                                  <td>{idx + 1}</td>
                                  <td>{item.item_name}</td>
                                  <td>{item.sku}</td>
                                  <td>{item.total_qty}</td>
                                  <td>
                                    <ul className="list-disc pl-5">
                                      {item.serial_numbers.map((sn: any, snIdx: any) => (
                                        <li
                                          key={snIdx}
                                          className={`${
                                            barcodeSn === sn.barcode_sn ? 'text-blue-400 font-bold' : ''
                                          }`}
                                        >
                                          {sn.barcode_sn}
                                        </li>
                                      ))}
                                    </ul>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="table w-full">
                            <thead>
                              <tr>
                                <th>No</th>
                                <th>Nama Barang</th>
                                <th>SKU</th>
                                <th>Quantity</th>
                                <th className="min-w-[250px]">Barcode SN</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td colSpan={5} className="text-center">
                                  Tidak ada data.
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                      <span className="text-info">
                        {messageSaveAllInvoice}
                      </span>
                      <span className="text-success block">
                        {successMessageEditAllInvoice}
                      </span>
                      {alreadyCheckAllInvoice && (
                        <>
                        <div className='flex mt-2'>
                          <button onClick={handleYakinEditAllInvoice} className={`btn btn-sm btn-primary text-white block ${yakinEditAllInvoiceButton ? 'animate-pulse' : ''}`} disabled={editTempInvoice === editInvoice || yakinEditAllInvoiceButton}>
                            {yakinEditAllInvoiceButton ? "Mengubah..." : "Yakin"}
                          </button>
                          <button onClick={() => {
                            setAlreadyCheckAllInvoice(false)
                            setEditTempInvoice(editInvoice)
                            setEditAllInvoice(false)
                            setMessageSaveAllInvoice('Note: Invoice baru akan dibuat jika belum ada, jika ada maka akan digabungkan.');
                            setInvoiceDataPreview([])
                            }} className="btn btn-sm btn-error text-white block ml-2">
                            Tidak
                          </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Tab 2 */}
                    <input
                      type="radio"
                      name="my_tabs_2"
                      role="tab"
                      className={`tab ${
                        activeTab === "tab2"
                          ? "tab-active text-white [--tab-bg:blue] [--tab-border-color:blue-dark] dark:[--tab-bg:blue-dark]"
                          : ""
                      }`}
                      aria-label="Tambah SN ke Invoice"
                      onClick={() => setActiveTab("tab2")}
                    />
                    <div
                      role="tabpanel"
                      className={`tab-content bg-base-100 border-base-300 rounded-box p-6 ${
                        activeTab === "tab2" ? "block" : "hidden"
                      }`}
                    >
                      <AddScannedByInvoice invoice_number={editInvoice} />
                    </div>
                  </div>
                  <div className='divider divider-info'></div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-lg">{invoiceData.invoice_number}</h3>
                    <div className='flex items-center space-x-2'>
                      <p className="text-sm text-gray-500 dark:text-gray-300">| Total Barang: {invoiceData.items.length}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-300">| Total Quantity: {invoiceData.total_qty}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Barang:</h4>
                    <button
                      className={`btn btn-sm btn-primary ${isRefreshLoading ? 'disabled animate-pulse' : ''}`}
                      onClick={() => refreshTableData()}
                      disabled={isRefreshLoading} // Ensures it is programmatically disabled
                    >
                      {isRefreshLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Nama Barang</th>
                          <th>SKU</th>
                          <th>Quantity</th>
                          <th className="min-w-[250px]">Barcode SN</th> {/* Adjust width here */}
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.items.map((item: any, idx: any) => (
                          <tr key={idx} className='hover:bg-base-200'>
                            <td>{idx + 1}</td>
                            <td>{item.item_name}</td>
                            <td>{item.sku}</td>
                            <td>{item.total_qty}</td>
                            <td>
                              <ul className="list-disc pl-5">
                                {item.serial_numbers.map((sn: any, snIdx: any) => (
                                  <li
                                    key={snIdx}
                                    className={`${
                                      barcodeSn === sn.barcode_sn ? 'text-blue-400 font-bold' : ''
                                    }`}
                                  >
                                    {sn.barcode_sn}
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <p>Tidak ada data / Invoice sudah diganti</p>
            )}
            <div className="flex justify-end mt-5">
              <button
                className="btn"
                onClick={() => {
                  const modal = document.getElementById('edit_invoice_modal') as HTMLDialogElement | null;
                  if (modal) {
                    modal.close();
                  }
                }}
              >
                Tutup
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>


      {/* Drawer (Inovice Edit) */}
      <div className="drawer drawer-end z-50">
        <input id="edit_invoice_report" type="checkbox" className="drawer-toggle" />
          <div className="drawer-side">
          <label htmlFor="edit_invoice_report" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          <div className="badge badge-neutral mb-2">Edit Invoice</div>
          <h1 className="text-gray-700">{editSku} | {namaBarang}</h1>

          {/* Quantity Input */}
            {/* <div className="my-4">
              <label htmlFor="quantity" className="text-sm font-medium mb-2 block">Quantity</label>
              <input
                type="number"
                id="quantity"
                placeholder="Enter quantity"
                className="input input-bordered w-3/4"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div> */}

            {/* Barcode SN Input */}
            <div className="my-2">
              <label htmlFor="barcode_sn" className="text-sm font-medium mb-2 block">Invoice</label>
              <input
                type="text"
                id="invoice"
                placeholder="Enter Invoice"
                className="input input-bordered w-3/4"
                value={editInvoice}
                onChange={(e) => setEditInvoice(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="">
              <label htmlFor="edit_invoice_report" className="btn btn-ghost btn-sm">Cancel</label>
              <button
                className="btn btn-primary btn-sm mx-2"
                onClick={handleSaveEditInvoice}
                disabled={(editInvoice === editOriginalInvoice) || isSaving} // Disable button if unchanged or saving
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Success/Error Message */}
            {saveSuccess !== null && (
              <div className={`mt-4 text-sm ${saveSuccess ? 'text-green-500' : 'text-red-500'}`}>
                {saveSuccess ? 'Saved successfully!' : ''}
              </div>
            )}
            {validationError && <div className="text-red-500">{validationError}</div>}
          </div>
        </div>
      </div>

      {/* Drawer (Invoice Edit) */}
      <div className="drawer drawer-end z-50">
        <input id="edit_sn_report" type="checkbox" className="drawer-toggle" />
          <div className="drawer-side">
          <label htmlFor="edit_sn_report" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          <div className="badge badge-neutral mb-2">Edit SN</div>
          <h1 className="text-gray-700">{editSku} | {namaBarang}</h1>

          {/* Quantity Input */}
            {/* <div className="my-4">
              <label htmlFor="quantity" className="text-sm font-medium mb-2 block">Quantity</label>
              <input
                type="number"
                id="quantity"
                placeholder="Enter quantity"
                className="input input-bordered w-3/4"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div> */}

            {/* Barcode SN Input */}
            <div className="my-2">
              <label htmlFor="barcode_sn" className="text-sm font-medium mb-2 block">Barcode SN</label>
              <input
                type="text"
                id="barcode_sn"
                placeholder="Enter Barcode Serial Number"
                className="input input-bordered w-3/4"
                value={barcodeSn}
                onChange={(e) => setBarcodeSn(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="">
              <label htmlFor="edit_sn_report" className="btn btn-ghost btn-sm">Cancel</label>
              <button
                className="btn btn-primary btn-sm mx-2"
                onClick={handleSaveEditBarcodeSN}
                disabled={(quantity === originalQuantity && barcodeSn === originalBarcodeSn) || isSaving} // Disable button if unchanged or saving
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Success/Error Message */}
            {saveSuccess !== null && (
              <div className={`mt-4 text-sm ${saveSuccess ? 'text-green-500' : 'text-red-500'}`}>
                {saveSuccess ? 'Saved successfully!' : ''}
              </div>
            )}
            {validationError && <div className="text-red-500">{validationError}</div>}
          </div>
        </div>
      </div>
        <div className="">
          {!hasReadPermission ? (
            <>
              <FeatureDisabled />
            </>
          ) : (
            <>
            {/* Filter Inputs */}
              <div className='flex justify-between mr-2 mx-2'>
                  <div className="gap-4 mb-4 mt-2 flex">
                    {/* Filter Per Page Value */}
                    <div className="dropdown relative">
                      <label
                        tabIndex={0}
                        className="btn bg-white dark:bg-gray-800 flex items-center justify-between w-auto btn-sm border-gray-300 dark:border-gray-700"
                        onClick={toggleDropdownPerPage}
                      >
                        <span className="text-black dark:text-white">
                          Per halaman: {perPage === 500 ? "500" : perPage} data
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className={`ml-2 w-5 h-5 transform transition-transform ${
                            perPageisOpen ? "rotate-180" : ""
                          } dark:stroke-white`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </label>
                      <ul
                        tabIndex={0}
                        className={`dropdown-content menu p-2 shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-box w-52 z-50 absolute mt-2 ${
                          perPageisOpen ? "block" : "hidden"
                        }`}
                      >
                        {perPageValueOptions.map((option) => (
                          <li key={option}>
                            <a
                              onClick={() => {
                                // Allow "Semua" only if skuSearch has more than 4 characters
                                if (option === 500 && skuSearch && skuSearch.length > 4) {
                                  handlePerPageChange(option);
                                  setPerPageIsOpen(false); // Close dropdown on selection
                                }
                                // Allow other options unconditionally
                                if (option !== 500) {
                                  handlePerPageChange(option);
                                  setPerPageIsOpen(false); // Close dropdown on selection
                                }
                              }}
                              className={`block px-4 py-2 rounded ${
                                option === 500
                                  ? skuSearch && skuSearch.length > 4
                                    ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              } ${
                                perPage === option
                                  ? "active text-primary font-bold bg-gray-100 dark:bg-gray-700"
                                  : ""
                              }`}
                            >
                              {option === 500 ? "500" : option}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className='flex'>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="input input-bordered input-sm"
                        placeholder="Start Date"
                      />
                      <div className='mt-1 mx-3 text-sm'>Sampai</div>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="input input-bordered input-sm"
                        placeholder="End Date"
                      />
                    </div>
                  </div>
                  <div className='flex mt-1.5'>  
                  {hasExportPermission && (
                    <div className="dropdown mr-2">
                      {/* Button to trigger dropdown */}
                      <div tabIndex={0} role="button" className="btn btn-success btn-sm text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 48 48">
                          <path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"></path>
                          <path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"></path>
                          <path fill="#2E7D32" d="M27 42L6 38 6 10 27 6z"></path>
                          <path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"></path>
                        </svg>
                        Export Excel
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>

                      {/* Dropdown menu */}
                      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                        <li>
                          <a onClick={handleExportPerItem}>Export Per-item</a>
                        </li>
                        <li>
                          <a onClick={handleExportGrouping}>Export Grouping</a>
                        </li>
                      </ul>
                    </div>
                  )}
                  {/* Dropdown Menu */}
                  <div className="relative w-auto">
                      <div className="">
                        <label
                          tabIndex={0}
                          className="btn bg-white dark:bg-gray-800 flex items-center justify-between w-full btn-sm border-gray-300 dark:border-gray-700"
                          onClick={toggleDropdownSearchFilter}
                        >
                          <span className="text-black dark:text-white">
                            Search Filter: {selectedFilter ? selectedFilter : "Semua"}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`ml-2 w-5 h-5 transform transition-transform ${
                              searchFilterisOpen ? "rotate-180" : ""
                            } dark:stroke-white`}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </label>
                        <ul
                          tabIndex={0}
                          className={`dropdown-content menu p-2 shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-box w-full z-10 absolute mt-2 ${
                            searchFilterisOpen ? "block" : "hidden"
                          }`}
                        >
                          {["SKU", "Invoice", "SN", "Semua"].map((option) => (
                            <li key={option} onBlur={() => setSearchFilterIsOpen(false)}>
                              <a
                                onClick={() => {
                                  handleChange(option);
                                  setSearchFilterIsOpen(false); // Close dropdown on selection
                                }}
                                className={`block px-4 py-2 rounded ${
                                  selectedFilter === option
                                    ? "active text-primary font-bold bg-gray-100 dark:bg-gray-700"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                }`}
                              >
                                {option}
                              </a>
                            </li>
                          ))}
                          <li>
                            <label className="flex items-center px-4 py-2 rounded focus:bg-gray-500">
                              <input
                                type="checkbox"
                                className="checkbox mr-2"
                                checked={isExactSearch}
                                onChange={toggleExactSearch}
                              />
                              Exact Search
                            </label>
                          </li>
                        </ul>
                      </div>

                      <div className="mt-0.5">
                        {error && <div className="text-red-500 mb-2">{error}</div>}
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
                            className="block w-full input-sm p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                            placeholder="Cari sku, barcode sn, inv"
                            required
                          />
                        </div>
                      </div>
                    </div>

                </div>
              </div>
              <div className='ml-2 mb-2'>
                <button
                  onClick={() => {
                    setCheckDuplicate(!checkDuplicate);
                    setTotalItem(0);
                  }}
                  className="btn btn-sm flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-300 dark:text-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-900"
                >
                  Cek SN Duplikat:
                  <span
                    className={`badge ${
                      checkDuplicate ? "badge-success text-white" : "badge-error text-white"
                    }`}
                  >
                    {checkDuplicate ? "ON" : "OFF"}
                  </span>
                </button>
              </div>
            <table className="table w-full">
              {/* Table Head */}
              <thead>
                <tr>
                  <th>Date</th>
                  <th>SKU</th>
                  <th className='w-[250px]'>Nama Barang</th>
                  <th>Invoice Number</th>
                  <th>Barcode SN</th>
                  <th>User</th>
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
              ) : scannedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                scannedItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-base-200 dark:hover:bg-gray-700 group transition duration-150`}
                  >
                    <td>{convertToJakartaTime(item.created_at)}</td>
                    <td>{item.sku}</td>
                    <td>{item.master_item.nama_barang}</td>
                    <td>
                      <div className="flex items-center space-x-1 justify-between">
                        <div>
                          {item.invoice_number?.length > 30 
                          ? `${item.invoice_number.slice(0, 30)}...` 
                          : item.invoice_number}
                        </div>
                        <div className="tooltip opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none transition-opacity duration-150" data-tip="Edit Invoice" style={{ minWidth: "24px", minHeight: "24px" }}>
                        <label
                            htmlFor="edit_invoice_report"
                            onClick={() =>
                              handleEditInvoice(
                                item.id,
                                item.sku,
                                item.qty,
                                item.barcode_sn,
                                item.master_item.nama_barang,
                                item.invoice_number
                              )
                            }
                          >
                            <EditIcon />
                          </label>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-1 justify-between">
                        <div>
                          {item.barcode_sn?.length > 30 
                          ? `${item.barcode_sn.slice(0, 30)}...` 
                          : item.barcode_sn}
                        </div>
                        <div className="tooltip opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none transition-opacity duration-150" data-tip="Edit SN" style={{ minWidth: "24px", minHeight: "24px" }}>
                        <label
                            htmlFor="edit_sn_report"
                            onClick={() =>
                              handleEditBarcodeSN(
                                item.id,
                                item.sku,
                                item.qty,
                                item.barcode_sn,
                                item.master_item.nama_barang
                              )
                            }
                          >
                            <EditIcon />
                          </label>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-bold">{item.user.name}</div>
                          <div className="text-sm opacity-50">
                            {item.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <th>
                      {hasUpdatePermission && (
                        <label
                          className="btn btn-ghost btn-xs text-blue-500"
                          onClick={() => {
                             handleEdit(
                                item.id,
                                item.sku,
                                item.qty,
                                item.barcode_sn,
                                item.master_item.nama_barang,
                                item.invoice_number
                              )
                          }}
                        >
                          Edit
                        </label>
                      )}
                      {hasDeletePermission && (
                        <button
                          className="btn btn-ghost btn-xs text-red-500"
                          onClick={() => {
                            const modal = document.getElementById(
                              "delete_modal"
                            ) as HTMLDialogElement | null;
                            if (modal) {
                              modal.showModal();
                            }
                            setDeleteReportId(item.id);
                            setDeleteInvoice(item.invoice_number)
                            setDeleteSku(item.sku);
                            setDeleteBarcodeSN(item.barcode_sn)
                            setDeleteNamaBarang(item.master_item.nama_barang)
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </th>
                  </tr>
                ))
              )}

              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className='flex justify-between'>
              <div className='flex'>
                {checkDuplicate ? (
                  <>
                    {totalItem >= 1 ? (
                      <>
                        <span className='mt-3 text-red-500'>Terdeteksi SN Duplikat:</span>
                      </>
                    ) : (
                      <>
                        <span className='mt-3 text-blue-500'>Tidak ada SN Duplikat!</span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span className='mt-3 text-gray-500'>Total barang di scan:</span>
                  </>
                )}
                <span className={`mt-3 ml-1`}>{totalItem ? totalItem :''}</span>
              </div>
              <span className='mt-3 badge badge-neutral badge-lg'>Halaman {currentPage}</span>
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
            </>
          )}

        </div>
      </>
    )}
export default TableReport;
