/* eslint-disable */
import React, { useState, useEffect } from 'react';

const TipsReport = () => {
  const [showScanSnFirstAlert, setScanSnFirstAlert] = useState(false);
  const [showScanSnSecondAlert, setShowScanSnSecondAlert] = useState(false);
  const [showScanSnThirdAlert, setShowScanSnThirdAlert] = useState(false);

  useEffect(() => {
    const firstAlertState = localStorage.getItem('showScanSnFirstAlert');
    const secondAlertState = localStorage.getItem('showScanSnSecondAlert');
    const thirdAlertState = localStorage.getItem('showScanSnThirdAlert');

    if (firstAlertState === "true") {
      setScanSnFirstAlert(true);
    }
    if (secondAlertState === "true") {
      setShowScanSnSecondAlert(true);
    }
    if (thirdAlertState === "true") {
      setShowScanSnThirdAlert(true);
    }
  }, []);

  const handleCloseFirstAlert = () => {
    setScanSnFirstAlert(false);
    localStorage.setItem('showScanSnFirstAlert', "false");
  };

  const handleCloseSecondAlert = () => {
    setShowScanSnSecondAlert(false);
    localStorage.setItem('showScanSnSecondAlert', "false");
  };

  const handleCloseThirdAlert = () => {
    setShowScanSnThirdAlert(false);
    localStorage.setItem('showScanSnThirdAlert', "false");
  };

  const handleShowTips = () => {
    setScanSnFirstAlert(true);
    setShowScanSnSecondAlert(true);
    setShowScanSnThirdAlert(true);
    localStorage.setItem('showScanSnFirstAlert', "true");
    localStorage.setItem('showScanSnSecondAlert', "true");
    localStorage.setItem('showScanSnThirdAlert', "true");
  };

  return (
    <>
      <div
        onClick={handleShowTips}
        className="flex items-center cursor-pointer text-primary mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6 mr-2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
        <span>Show Tips</span>
      </div>

      {showScanSnFirstAlert && (
        <div role="alert" className="alert alert-info shadow-md flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="ml-2 flex-grow">Pilih tanggal atau masukkan kata kunci pencarian untuk mengekspor laporan Excel sesuai filter yang dipilih, atau biarkan kosong untuk mengekspor seluruh laporan.</span>
          <button
            onClick={handleCloseFirstAlert}
            className="btn btn-sm btn-circle btn-ghost ml-2">
            ✕
          </button>
        </div>
      )}

      {showScanSnSecondAlert && (
        <div role="alert" className="alert alert-info shadow-md mt-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="ml-2 flex-grow">Cari terlebih dahulu & Minimal sudah mengetik 5 huruf atau lebih, kemudian pilih 'Per halaman:', maka tombol '500' akan aktif.</span>
          <button
            onClick={handleCloseSecondAlert}
            className="btn btn-sm btn-circle btn-ghost ml-2">
            ✕
          </button>
        </div>
      )}

      {showScanSnThirdAlert && (
        <div role="alert" className="alert alert-info shadow-md mt-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="ml-2 flex-grow">
            Gunakan filter pencarian untuk mencari berdasarkan SKU, Invoice, atau Barcode SN. Jika "Exact Search" dicentang, pencarian akan mencari data yang tepat. Jika tidak dicentang, pencarian bisa menggunakan kata kunci parsial.
          </span>
          <button
            onClick={handleCloseThirdAlert}
            className="btn btn-sm btn-circle btn-ghost ml-2">
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default TipsReport;
