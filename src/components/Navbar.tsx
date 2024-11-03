"use client";

import Image from 'next/image';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { logoutUser } from '@/api/auth/auth';
import Link from 'next/link';
import { useUserContext } from '@/context/userContext'; // Import the user context
import { clearUserCache } from '@/api/user/user';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-100 z-50">
    <span className="loading loading-ring loading-md"></span>
  </div>
);


const Navbar = () => {
  const router = useRouter();
  const { user, loading } = useUserContext(); // Use the user context
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      clearUserCache(); // Ensure you clear the cache
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const pathname = usePathname();
  const renderNavItem = (path: string, label: string) => (
    <li key={path}>
      <Link href={path} aria-label={label} className={pathname === path ? 'bg-gray-300 mx-1' : 'mx-1'}>
        {label}
      </Link>
    </li>
  );

  const hasMasterItemRole = user?.roles.some(role => role.name === 'master-item');
  const hasOfficeRole = user?.roles.some(role => role.name === 'office');

  return (
    <div className="navbar bg-gray-100 dark:bg-base-100">
      {loading && <Spinner />}
      
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" aria-label="Menu" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            {!loading && (
              <>
                {hasMasterItemRole && renderNavItem('/master-item', 'Master Item')}
                {hasMasterItemRole && renderNavItem('/scanned-item', 'Scan SN')}
                {hasOfficeRole && renderNavItem('/report', 'Report')}
              </>
            )}
          </ul>
        </div>
        <Link href='/' className='btn btn-ghost text-xl'>Warehouse System</Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {!loading && (
            <>
              {hasMasterItemRole && renderNavItem('/master-item', 'Master Item')}
              {hasMasterItemRole && renderNavItem('/scanned-item', 'Scan SN')}
              {hasOfficeRole && renderNavItem('/report', 'Report')}
            </>
          )}
        </ul>
      </div>

      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" aria-label="User Menu" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <Image
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                alt="User Avatar"
                width={100}
                height={100}
                priority
              />
            </div>
          </div>
          <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li>
              <button onClick={handleLogout} className="w-full text-left" aria-label="Logout">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
