import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TableMaster from '@/components/master-item/TableMaster';

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
        <main className="p-6 flex-1">
          <div className="card shadow-xl bg-white">
            <div className="card-body">
              <h2 className="card-title">Master Item</h2>
              <TableMaster />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;
