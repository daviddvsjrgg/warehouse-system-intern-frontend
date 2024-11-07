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
        <main className="p-8 flex-1">
          <div className="card shadow-xl bg-white">
            <div className="card-body overflow-x-auto">
              <h1 className="text-2xl font-bold">Selamat Datang di Warehouse System</h1>
              <p className="mt-2 divider -mb-1">Intern Self Deployed | Description:</p>
              <p className="mt-2">Terakhir Deploy Kamis, 7 November 2024</p>
              <p>Frontend: <a className='text-blue-500 underline' href="https://anker.highking.cloud"target='_blank' rel="noopener noreferrer">anker.highking.cloud</a></p>
              <p>Backend: <a className='text-blue-500 underline' href="https://api-backend-ws-david-intern.vercel.app"target='_blank' rel="noopener noreferrer">api-backend-ws-david-intern.vercel.app</a></p>
              <p>API Doc: <a className='text-blue-500 underline' href="https://documenter.getpostman.com/view/10569515/2sAY4xA2Ec"target='_blank' rel="noopener noreferrer">dokumentasi</a></p>
              </div>
          </div>
          {/* Additional content can go here */}
        </main>
      </div>
    </div>
  );
};

export default Home;
