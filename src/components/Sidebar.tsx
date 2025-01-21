"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserContext } from '@/context/userContext';
import { useSidebarContext } from '@/context/SidebarContext'; // Import the context
import UserManagementIcon from '@/app/icon/UserManagementIcon';
import UsersIcon from '@/app/icon/UsersIcon';
import RoleIcon from '@/app/icon/RoleIcon';
import PermissionIcon from '@/app/icon/PermissionIcon';
import MasterItemIcon from '@/app/icon/MasterItemIcon';
import ScannedItemIcon from '@/app/icon/ScannedItemIcon';
import ReportIcon from '@/app/icon/ReportIcon';
import InjectInvoiceIcon from '@/app/icon/InjectInvoiceIcon';
import ScanIcon from '@/app/icon/ScanIcon';
import CheckInvoiceIcon from '@/app/icon/CheckInvoiceIcon';

const Sidebar = () => {
  const pathname = usePathname(); // Pathname to highlight active link
  const { user } = useUserContext(); // Get user context to check permissions

  // Use the context to manage dropdown state
  const {
    openUserManagementDropdown,
    openScanDropdown,
    toggleUserManagementDropdown,
    toggleScanDropdown,
  } = useSidebarContext(); // Get context values

  // Render navigation item function
  const renderNavItem = (path: string, label: string, Icon: React.FC) => (
    <li key={path}>
      <Link
        href={path}
        aria-label={label}
        className={`flex items-center p-2 rounded-md ${pathname === path ? 'bg-gray-300 dark:bg-gray-700 font-bold' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
        replace
      >
        <Icon />
        {label}
      </Link>
    </li>
  );

  // Permission checks
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
          {hasUserManagement && (
            <li>
              <button
                onClick={() => toggleUserManagementDropdown('user-management')}
                className={`flex items-center justify-between w-full p-2 rounded-md ${openUserManagementDropdown === 'user-management' ? 'bg-gray-300 dark:bg-gray-700 font-bold' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                <span className="flex items-center">
                  <UserManagementIcon />
                  User Management
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`size-5 transform transition-transform duration-300 ${openUserManagementDropdown === 'user-management' ? 'rotate-180' : 'rotate-0'}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <ul
                className={`transition-all duration-300 ease-in-out overflow-hidden ${openUserManagementDropdown === 'user-management' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <li className="pl-6 mt-2">{renderNavItem('/user-management', 'Users', UsersIcon)}</li>
                <li className="pl-6 mt-2">{renderNavItem('/roles', 'Access', RoleIcon)}</li>
                <li className="pl-6 mt-2">{renderNavItem('/permissions', 'Permissions', PermissionIcon)}</li>
              </ul>
            </li>
          )}

          {hasMasterItemRole && renderNavItem('/master-item', 'Master Item', MasterItemIcon)}

          {/* Scan Dropdown */}
          {hasMasterItemRole && (
            <li>
              <button
                onClick={() => toggleScanDropdown('scan')}
                className={`flex items-center justify-between w-full p-2 rounded-md ${openScanDropdown === 'scan' ? 'bg-gray-300 dark:bg-gray-700 font-bold' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                <span className="flex items-center">
                  <ScanIcon />
                  Scan
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`size-5 transform transition-transform duration-300 ${openScanDropdown === 'scan' ? 'rotate-180' : 'rotate-0'}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <ul
                className={`transition-all duration-300 ease-in-out overflow-hidden ${openScanDropdown === 'scan' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <li className="pl-6 mt-2">{renderNavItem('/scanned-item', 'Scan SN', ScannedItemIcon)}</li>
                <li className="pl-6 mt-2">{renderNavItem('/inject-invoice', 'Inject Invoice', InjectInvoiceIcon)}</li>
                <li className="pl-6 mt-2">{renderNavItem('/invoice-sn', 'Tambah SN Lama', CheckInvoiceIcon)}</li>
              </ul>
            </li>
          )}

          {hasOfficeRole && renderNavItem('/report', 'Report', ReportIcon)}
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
