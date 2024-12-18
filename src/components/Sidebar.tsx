"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserContext } from '@/context/userContext';

const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useUserContext();

  // Define icons for each navigation item
  const UserManagementIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );

  const MasterItemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );

  const ScannedItemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );

  const ReportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );

  // Modify renderNavItem to include icons
  const renderNavItem = (path: string, label: string, Icon: React.FC) => (
    <li key={path}>
      <Link
        href={path}
        aria-label={label}
        className={`flex items-center p-2 rounded-md ${
          pathname === path
            ? 'bg-gray-300 dark:bg-gray-700 font-bold'
            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        <Icon />
        {label}
      </Link>
    </li>
  );

  const hasUserManagement = user?.roles?.some((role) => role.name === 'user-management');
  const hasMasterItemRole = user?.roles?.some((role) => role.name === 'master-item');
  const hasOfficeRole = user?.roles?.some((role) => role.name === 'office');

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg hidden lg:block">
      <aside className="p-4">
        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Warehouse System
        </Link>
        <ul className="mt-6 space-y-4">
          {hasUserManagement &&
            renderNavItem('/user-management', 'User Management', UserManagementIcon)}
          {hasMasterItemRole &&
            renderNavItem('/master-item', 'Master Item', MasterItemIcon)}
          {hasMasterItemRole &&
            renderNavItem('/scanned-item', 'Scan SN', ScannedItemIcon)}
          {hasOfficeRole && renderNavItem('/report', 'Report', ReportIcon)}
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
