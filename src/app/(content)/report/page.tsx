"use client";

import TableReport from '@/components/report/TableReport';
import Navbar from '@/components/Navbar';
import React from 'react';

const Page = () => {
  return (
    <div>
      <Navbar />
      <div className='px-6 py-4'>
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
