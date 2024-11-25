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
              <p className="mt-2 divider -mb-1 dark:text-gray-400">
                Intern Self Deployed | Description:
              </p>
              <p className="mt-2 dark:text-gray-300">
                Terakhir Deploy: <span className="font-medium">Kamis, 7 November 2024</span>
              </p>

              {/* Links Section */}
              <p className="mt-2 dark:text-gray-300">
                Frontend:{" "}
                <a
                  className="text-blue-500 dark:text-blue-400 underline"
                  href="https://anker.highking.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  anker.highking.cloud
                </a>
              </p>
              <p className="dark:text-gray-300">
                Backend:{" "}
                <a
                  className="text-blue-500 dark:text-blue-400 underline"
                  href="https://api-backend-ws-david-intern.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  api-backend-ws-david-intern.vercel.app
                </a>
              </p>
              <p className="dark:text-gray-300">
                API Doc:{" "}
                <a
                  className="text-blue-500 dark:text-blue-400 underline"
                  href="https://documenter.getpostman.com/view/10569515/2sAY4xA2Ec"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  dokumentasi
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
