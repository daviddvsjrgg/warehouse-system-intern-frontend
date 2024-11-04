"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserContext } from '@/context/userContext';

const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useUserContext();
  
  const renderNavItem = (path: string, label: string) => (
    <li key={path}>
      <Link href={path} aria-label={label} className={pathname === path ? 'block p-2 rounded-md bg-gray-300 font-bold ' : 'block p-2 rounded-md hover:bg-gray-200 '}>
        {label}
      </Link>
    </li>
  );
  
  const hasMasterItemRole = user?.roles?.some(role => role.name === 'master-item');
  const hasOfficeRole = user?.roles?.some(role => role.name === 'office');
  
  return (
    <div className='fixed top-0 left-0 h-full w-64 bg-white hidden lg:block'>
      <aside className={`sidebar-default-styles p-2`}>
        <Link href="/" className="text-xl btn btn-ghost">Warehouse System</Link>
        <ul className="space-y-2 p-4">
          {hasMasterItemRole && renderNavItem('/master-item', 'Master Item')}
          {hasMasterItemRole && renderNavItem('/scanned-item', 'Scan SN')}
          {hasOfficeRole && renderNavItem('/report', 'Report')}
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
