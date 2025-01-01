import React, { useState, useEffect } from 'react';

const TipsReport = () => {
  const [showFirstAlert, setShowFirstAlert] = useState(false);
  const [showSecondAlert, setShowSecondAlert] = useState(false);

  useEffect(() => {
    const firstAlertState = localStorage.getItem('showFirstAlert');
    const secondAlertState = localStorage.getItem('showSecondAlert');

    if (firstAlertState === "true") {
      setShowFirstAlert(true);
    }
    if (secondAlertState === "true") {
      setShowSecondAlert(true);
    }
  }, []);

  const handleCloseFirstAlert = () => {
    setShowFirstAlert(false);
    localStorage.setItem('showFirstAlert', "false");
  };

  const handleCloseSecondAlert = () => {
    setShowSecondAlert(false);
    localStorage.setItem('showSecondAlert', "false");
  };

  const handleShowTips = () => {
    setShowFirstAlert(true);
    setShowSecondAlert(true);
    localStorage.setItem('showFirstAlert', "true");
    localStorage.setItem('showSecondAlert', "true");
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

      {showFirstAlert && (
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

      {showSecondAlert && (
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
          <span className="ml-2 flex-grow">Cari terlebih dahulu, kemudian pilih 'Per halaman:', maka tombol 'Semua' akan aktif.</span>
          <button
            onClick={handleCloseSecondAlert}
            className="btn btn-sm btn-circle btn-ghost ml-2">
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default TipsReport;