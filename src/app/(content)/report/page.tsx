"use client";

import TableReport from '@/components/report/TableReport';
import Navbar from '@/components/Navbar';
import React, { useEffect } from 'react';

const Page = () => {
  useEffect(() => {
    // Get the current URL path after the domain (window.location.pathname)
    const currentPath = window.location.pathname;

    // Store the current path in localStorage
    localStorage.setItem('onUrl', currentPath);
  }, []); // Empty dependency array to run this effect only once when the component mounts

  return (
    <div>
      <Navbar />
      <div className='px-6 py-4 '>
        <div className="card shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Report Item Barang</h2>
            <TableReport />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
