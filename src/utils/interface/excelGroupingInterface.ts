export interface Item {
    created_at: string;
    invoice_number: string;
    sku: string;
    master_item: {
        nama_barang: string;
    };
    user: {
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
    Email: string;
}

export interface ExportData {
    Date: string;
    'Invoice Number': string;
    Email: string;
    SKU: string; // Choose how to represent multiple SKUs
    'Nama Barang': string;
    'Barcode SN': string;
    Quantity: number; // Total Quantity
}