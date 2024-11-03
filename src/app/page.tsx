"use client";

import React from 'react';
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const Home = () => {
  return (
    <div className="flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content area with margin to accommodate fixed sidebar */}
      <div className="lg:ml-64 ml-0 flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="p-4 flex-1">
          <h1 className="text-2xl font-bold">Selamat Datang di Warehouse System</h1>
          <p className="mt-2">Terakhir Deploy Senin, 3 November 2024</p>
          {/* Additional content can go here */}
        </main>
      </div>
    </div>
  );
};

export default Home;
