/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { fetchRolesPermissions } from '@/api/user-management/roles'; // Adjust the import based on where you store the fetch function
import { fetchPermissions } from '@/api/user-management/permissions'; // Import the function to fetch permissions
import { updateRolePermissions } from '@/api/user-management/roles'; // Import the function to update role permissions

const TableRole = () => {
  const [rolesData, setRolesData] = useState<any[]>([]); // State to hold roles and permissions
  const [permissionsData, setPermissionsData] = useState<any[]>([]); // State to hold permissions
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page number
  const [totalPages, setTotalPages] = useState<number>(1); // Total number of pages
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // State to manage success message

  // Fetch roles and permissions when the component mounts or page changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch roles and permissions
        const rolesResponse = await fetchRolesPermissions(currentPage, '', 5); // Fetch roles with pagination
        setRolesData(rolesResponse.data.data); // Assuming `data.data` contains the roles
        setTotalPages(rolesResponse.data.last_page); // Set total pages from the API response

        const permissionsResponse = await fetchPermissions(currentPage); // Fetch all permissions (page 1)
        setPermissionsData(permissionsResponse.data); // Set the permissions data
      } catch (err) {
        setError('Failed to fetch roles and permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]); // Run when currentPage changes

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return; // Prevent navigating out of bounds
    setCurrentPage(newPage);
  };

  const handleCheckboxChange = async (roleId: number, permissionId: number) => {
    // Toggle the permission for the specific role without setting loading state
    const updatedRolesData = rolesData.map(role =>
      role.id === roleId
        ? {
            ...role,
            permissions: role.permissions.some(
              (perm: any) => perm.id === permissionId
            )
              ? role.permissions.filter((perm: any) => perm.id !== permissionId) // Remove permission if unchecked
              : [...role.permissions, { id: permissionId, name: permissionsData.find(perm => perm.id === permissionId)?.name }]
        }
        : role
    );

    setRolesData(updatedRolesData);

    // Prepare the permissions array to send to the API
    const permissionsToUpdate = updatedRolesData.find(role => role.id === roleId)?.permissions.map((perm: any) => perm.id) || [];

    // Now send the update request
    setError(null);
    setSuccessMessage(null); // Clear previous success message

    try {
      // Update the role permissions in the backend
      await updateRolePermissions(roleId, permissionsToUpdate);
      setSuccessMessage('Permission berhasil diperbarui'); // Set success message after update

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000); // 3 seconds delay
    } catch (err) {
      setError('Failed to update role permissions');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {successMessage && (
        <div
          role="alert"
          className="fixed flex mr-2 bottom-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-bounce transition-all duration-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className='ml-2'>{successMessage}</span>
        </div>
      )}

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Nama Role
              </th>
              <th scope="col" className="px-6 py-3">
                Permissions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center">
                  <span className="loading loading-dots loading-sm"></span>
                </td>
              </tr>
            ) : (
              rolesData.map((role) => (
                <tr key={role.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {role.name}
                  </th>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      {permissionsData.map((permission) => {
                        const hasPermission = role.permissions.some((perm: any) => perm.id === permission.id);
                        return (
                          <label key={permission.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              onChange={() => handleCheckboxChange(role.id, permission.id)} // Handle checkbox change
                              className="checkbox"
                            />
                            <span className="ml-2">{permission.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 mx-2"
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableRole;
