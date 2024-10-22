"use client";

import AddMaster from '@/components/master-item/AddMaster';
import TableMaster from '@/components/master-item/TableMaster';
import Navbar from '@/components/Navbar';
import React from 'react';

const Page = () => {
  return (
    <div>
      <Navbar />
      <div className='px-6 py-4'>
        <div className="card shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Master Item</h2>
            <TableMaster />
          </div>
        </div>
      </div>
      <div className='px-6 py-4'>
        <div className="card shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Tambah Master Item</h2>
            <AddMaster />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
