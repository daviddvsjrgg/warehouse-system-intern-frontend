"use client";

import React from 'react';
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const Home = () => {
  return (
    <div className="flex min-h-screen dark:bg-gray-900">
      {/* Sidebar (Fixed) */}
      <Sidebar />

      {/* Main content area */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="p-8 flex-1">
          <div className="card shadow-xl bg-white dark:bg-gray-800">
            <div className="card-body overflow-x-auto">
              {/* Welcome Message */}
              <h1 className="text-2xl font-bold dark:text-gray-200">
                Selamat Datang di Warehouse System
              </h1>
              <p className="mt-2 dark:text-gray-300">
                Terakhir Push: <span className="font-medium">Selasa, 29 April 2025, 15:00 WIB</span>
              </p>

              {/* Links Section */}
              <p className="dark:text-gray-300">
                *Akan logout otomatis setelah tidak aktif selama 1 Jam.
              </p>
              <p className="dark:text-gray-300">
                *Jika Sidebar/Menu Tidak muncul, silahkan login!
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
