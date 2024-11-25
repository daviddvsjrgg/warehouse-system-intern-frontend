"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserContext } from '@/context/userContext';

const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useUserContext();

  const renderNavItem = (path: string, label: string) => (
    <li key={path}>
      <Link
        href={path}
        aria-label={label}
        className={`block p-2 rounded-md ${
          pathname === path
            ? 'bg-gray-300 dark:bg-gray-700 font-bold'
            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        {label}
      </Link>
    </li>
  );

  const hasMasterItemRole = user?.roles?.some((role) => role.name === 'master-item');
  const hasOfficeRole = user?.roles?.some((role) => role.name === 'office');

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg hidden lg:block">
      <aside className="p-4">
        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Warehouse System
        </Link>
        <ul className="mt-6 space-y-4">
          {hasMasterItemRole && renderNavItem('/master-item', 'Master Item')}
          {hasMasterItemRole && renderNavItem('/scanned-item', 'Scan SN')}
          {hasOfficeRole && renderNavItem('/report', 'Report')}
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
