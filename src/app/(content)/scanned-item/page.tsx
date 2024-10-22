"use client";

import Navbar from '@/components/Navbar';
import AddScanned from '@/components/scanned-item/AddScanned';
import React from 'react';

const Page = () => {
  return (
    <div>
      <Navbar />
      <div className='px-6 py-4'>
        <div className="card shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Scan SN</h2>
            <AddScanned />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
