"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TableReport from '@/components/report/TableReport';
import TipsReport from '@/components/report/TipsReport';

const Page = () => {
  return (
    <div className="flex min-h-screen dark:bg-gray-900">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content area with left margin to account for fixed sidebar */}
      <div className="lg:ml-64 ml-0 flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="p-6 flex-1">
          <div className="card shadow-xl bg-white dark:bg-gray-800 mb-2">
            <div className="card-body text-gray-900 dark:text-gray-100 overflow-x-auto">
              <h2 className="card-title">Tips</h2>
              <TipsReport />
            </div>
          </div>
          <div className="card shadow-xl bg-white dark:bg-gray-800">
            <div className="card-body text-gray-900 dark:text-gray-100 overflow-x-auto">
              <h2 className="card-title">Report Item Barang</h2>
              <TableReport />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;
