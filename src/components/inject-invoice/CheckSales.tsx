import React, { useState } from 'react';

const CheckSales = () => {
  // State to keep track of barcode serial numbers
  const [barcodes, setBarcodes] = useState<string[]>([""]);
  const [invoice, setInvoice] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Handle adding a new barcode input field
  const addBarcode = () => {
    setBarcodes([...barcodes, ""]);
  };

  // Handle changing barcode serial number value
  const handleBarcodeChange = (index: number, value: string) => {
    const updatedBarcodes = [...barcodes];
    updatedBarcodes[index] = value;
    setBarcodes(updatedBarcodes);
  };

  // Handle removing a barcode input field
  const removeBarcode = (index: number) => {
    const updatedBarcodes = barcodes.filter((_, i) => i !== index);
    setBarcodes(updatedBarcodes);
  };

  // Handle the "Check" button click
  const handleCheck = () => {
    // Check if the barcode SN inputs are empty
    const emptyBarcodes = barcodes.some((barcode) => barcode.trim() === "");

    if (emptyBarcodes) {
      // Set error message if any barcode SN is empty
      setErrorMessage("Barcode SN masih belum terisi semua.");
    } else {
      // Clear the error message and log the data if all inputs are valid
      setErrorMessage("");
      const data = {
        invoice: invoice,
        barcode_sn: barcodes
      };
      console.log(data);
    }
  };

  return (
    <div>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Invoice</span>
        </div>
        <input 
          type="text" 
          placeholder="Enter invoice"
          value={invoice}
          onChange={(e) => setInvoice(e.target.value)} 
          className="input input-bordered w-full max-w-xs" 
        />
      </label>

      {/* Barcode SN Inputs - 3 Column Grid Layout */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        {barcodes.map((barcode, index) => (
          <div key={index} className="flex items-center">
            <div className="w-full max-w-xs">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Barcode SN {index + 1}</span>
                </div>
                <input 
                  type="text"
                  value={barcode}
                  onChange={(e) => handleBarcodeChange(index, e.target.value)}
                  placeholder="Enter barcode SN"
                  className="input input-bordered w-full"
                />
              </label>
            </div>

            {/* Show "-" Button only if it's not the first barcode input */}
            {index > 0 && (
              <button 
                type="button"
                className="btn btn-danger ml-2 btn-sm"
                onClick={() => removeBarcode(index)}
              >
                -
              </button>
            )}

            {/* Show "+" Button only for the last input */}
            {index === barcodes.length - 1 && (
              <button 
                type="button"
                className="btn btn-info ml-2 btn-sm"
                onClick={addBarcode}
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-red-500 mt-2">{errorMessage}</p>
      )}

      {/* Check Button */}
      <div className="mt-3">
        <button 
          type="button"
          className="btn btn-primary"
          onClick={handleCheck}
        >
          Check
        </button>
      </div>
    </div>
  );
};

export default CheckSales;
