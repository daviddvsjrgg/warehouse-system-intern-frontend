"use client";

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { logoutUser } from '@/api/auth/auth';
import Link from 'next/link';
import { getUser } from '@/api/user/user';
import { User } from '@/utils/interface/userInterface';

const Spinner = () => (
  <span className="loading loading-ring loading-md"></span>
  // <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-100 z-50">
  //   <span className="loading loading-spinner loading-lg"></span>
  // </div>
);

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  // Fetch user roles on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false); // End loading regardless of success or failure
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const renderNavItem = (path: string, label: string) => (
    <li>
      <button
        onClick={() => handleNavigation(path)}
        className={pathname === path ? 'bg-gray-300 mx-1' : 'mx-1'}
        aria-label={label}
      >
        {label}
      </button>
    </li>
  );

  // Determine access based on user roles
  const hasMasterItemRole = user?.roles.some(role => role.name === 'master-item');
  const hasOfficeRole = user?.roles.some(role => role.name === 'office');

  return (
    <div className="navbar bg-gray-100 dark:bg-base-100">
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
            {loading ? (
              <Spinner />
            ) : (
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
          {loading ? (
            <Spinner />
          ) : (
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
