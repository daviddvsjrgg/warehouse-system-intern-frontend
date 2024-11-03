"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TableReport from '@/components/report/TableReport';

const Page = () => {
  return (
    <div className="flex min-h-screen">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content area with left margin to account for fixed sidebar */}
      <div className="lg:ml-64 ml-0 flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="p-4 flex-1">
          <div className="card shadow-xl">
            <div className="card-body overflow-x-auto">
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
