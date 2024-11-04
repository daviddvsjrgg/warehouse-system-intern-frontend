// Adjust the interfaces
export interface Item {
    created_at: string;
    invoice_number: string;
    sku: string;
    master_item: {
        nama_barang: string;
    };
    user: {
        name: string;    // Add name field
        email: string;
    };
    barcode_sn: string;
    qty: number;
}

export interface GroupedItem {
    Date: string;
    'Invoice Number': string;
    Items: Array<{
        SKU: string;
        'Nama Barang': string;
        'Barcode SN': string;
        Quantity: number;
    }>;
    User: string; // Update to User instead of Email
}

export interface ExportData {
    Date: string;
    'Invoice Number': string;
    User: string; // Combined Name and Email
    SKU: string;
    'Nama Barang': string;
    'Barcode SN': string;
    Quantity: number;
}
