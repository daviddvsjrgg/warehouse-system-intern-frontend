"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/api/auth/auth';
import Link from 'next/link';

const Navbar = () => {
  const router = useRouter();
  const [activeLink, setActiveLink] = useState('');  // State to track the active link

  // Helper function to apply the gray background if the link matches the current active link
  const getLinkClass = (href: string) => {
    return href === activeLink ? 'bg-gray-300' : '';
  };

  // Function to handle the link click and set the active link
  const handleLinkClick = (href: string) => {
    setActiveLink(href);
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="navbar bg-gray-100 dark:bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
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
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link 
                href='/master-item'
                className={getLinkClass('/master-item')}
                onClick={() => handleLinkClick('/master-item')}
              >
                Master Item
              </Link>
            </li>
            <li>
              <Link 
                href='/scanned-item'
                className={getLinkClass('/scanned-item')}
                onClick={() => handleLinkClick('/scanned-item')}
              >
                Scan SN
              </Link>
            </li>
            <li>
              <Link 
                href='/report'
                className={getLinkClass('/report')}
                onClick={() => handleLinkClick('/report')}
              >
                Report
              </Link>
            </li>
          </ul>
        </div>
        <Link href='/' className='btn btn-ghost text-xl'>Warehouse System</Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link 
              href='/master-item'
              className={getLinkClass('/master-item')}
              onClick={() => handleLinkClick('/master-item')}
            >
              Master Item
            </Link>
          </li>
          <li className='mx-2'>
            <Link 
              href='/scanned-item'
              className={getLinkClass('/scanned-item')}
              onClick={() => handleLinkClick('/scanned-item')}
            >
              Scan SN
            </Link>
          </li>
          <li>
            <Link 
              href='/report'
              className={getLinkClass('/report')}
              onClick={() => handleLinkClick('/report')}
            >
              Report
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <Image
                className=""
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                alt="User Avatar"
                width={100}
                height={100}
                priority
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <button onClick={handleLogout} className="w-full text-left">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
