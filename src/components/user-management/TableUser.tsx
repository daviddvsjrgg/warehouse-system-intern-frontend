/* eslint-disable */ 
import React, { useState, useEffect } from 'react';
import { fetchUsers, PaginatedResponse, ItemDetails, Role, updateRoles, addUser } from '@/api/user-management/user-management'; // Adjust import path to your actual API service
import useDebounce from '@/hooks/useDebounce'; // Import the debounce hook

const TableUser: React.FC = () => {
  const [users, setUsers] = useState<ItemDetails[]>([]); // State to store users data
  const [loading, setLoading] = useState<boolean>(false); // State for loading indicator
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page state
  const [totalPages, setTotalPages] = useState<number>(1); // Total pages from API
  const [perPage] = useState<number>(5); // Items per page (fixed in this case)
  const [searchQuery, setSearchQuery] = useState<string>(''); // Search query state

  const [selectedUser, setSelectedUser] = useState<ItemDetails | null>(null); // Selected user for role change
  const [newRole, setNewRole] = useState<string[]>([]); // Declare newRole as an array of strings
  const [roles, setRoles] = useState<Role[]>([]); // Available roles for the user
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // State for submit button animation

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    roles: [] as string[],
  }); // State for the new user form

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debouncing the search query with 500ms delay

  // Function to fetch users data
  const getUsers = async (page: number, query: string) => {
    setLoading(true);
    try {
      const response: PaginatedResponse = await fetchUsers(page, query, perPage);
      setUsers(response.data.data); // Set users data
      setCurrentPage(response.data.current_page); // Set current page
      setTotalPages(response.data.last_page); // Set total pages
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when the component mounts or when the page/query changes
  useEffect(() => {
    getUsers(currentPage, debouncedSearchQuery); // Fetch data when debounced query changes
  }, [currentPage, debouncedSearchQuery]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page when search query changes
  };

  const openRoleModal = (user: ItemDetails) => {
  
    // Set the roles array (if multiple roles, set it to an array, not just the first role)
    const roleNames = user.roles.map((role) => role.name); // Extract role names into an array
    setNewRole(roleNames); // Set the newRole to an array of roles
    setSelectedUser(user); // Set the selected user for name display
    const modal = document.getElementById('change_role_modal') as HTMLDialogElement | null;
    if (modal) {
      modal.showModal(); // Open the modal
    }
  };

  // Open the modal to add user
  const openAddUserModal = () => {
    const modal = document.getElementById('add_user_modal') as HTMLDialogElement | null;
    if (modal) {
      modal.showModal(); // Open the modal
    }
  };
  
  // Close the modal
  const closeModal = () => {
    setSelectedUser(null);
    setNewRole([]);
    const modal = document.getElementById('change_role_modal') as HTMLDialogElement | null;
    if (modal) {
      modal.close(); // Close the modal
    }
  };

  // Close the modal and reset the form
  const closeAddUserModal = () => {
    setNewUser({ name: '', email: '', password: '', roles: [] });
    const modal = document.getElementById('add_user_modal') as HTMLDialogElement | null;
    if (modal) {
      modal.close(); // Close the modal
    }
  };


  // Handle checkbox change to add/remove roles
    const handleRoleCheckboxChange = (role: string) => {
        setNewRole((prevRoles) => {
        if (prevRoles.includes(role)) {
            // Remove role if already selected
            return prevRoles.filter((r) => r !== role);
        } else {
            // Add role if not already selected
            return [...prevRoles, role];
        }
        });
    };
    
    const saveUserRoles = async () => {
      if (selectedUser) {
        try {
          setIsSubmitting(true); // Start loading indicator
    
          const { id, name } = selectedUser; // Destructure id and name
          console.log('Preparing to update roles...');
          
          const response = await updateRoles(id, name, newRole); // Pass id, name, and newRole
          console.log('Roles updated successfully:', response);
    
          closeModal(); // Close modal on success
    
          // Refresh the user data for real-time updates
          await getUsers(currentPage, debouncedSearchQuery); // Fetch updated data
        } catch (error) {
          console.error('Error updating roles:', error);
        } finally {
          setIsSubmitting(false); // Stop loading indicator
        }
      }
    };

    const handleRoleCheckboxChangeForAddUser = (role: string) => {
      setNewUser((prevUser) => {
        const newRoles = prevUser.roles.includes(role)
          ? prevUser.roles.filter((r) => r !== role) // Remove the role if it's already selected
          : [...prevUser.roles, role]; // Add the role if it's not selected
  
        return { ...prevUser, roles: newRoles };
      });
    };
    
    const saveNewUser = async () => {
      try {
        const userData = {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          roles: newUser.roles,
        };
    
        // Call addUser API function
        const response = await addUser(userData);
    
        // Handle success (e.g., display a success message or close the modal)
        console.log('User added successfully:', response);
        closeAddUserModal(); // Assuming you have a function to close the modal
      } catch (error: unknown) {
        // Use type assertion to assume 'error' is an instance of 'Error'
        const e = error as Error;
        console.error('Error occurred while creating user:', e.message);
        throw new Error(`Failed to create user: ${e.message}`);
      }
    };
    

  return (
    <div className="p-4">
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 border border-gray-300 rounded-md w-full"
        />
      </div>

      <button
        className="px-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-3"
        onClick={() => openAddUserModal()} // Open modal on click
      >
        Tambah User Baru
      </button>

      {/* Table to display user data */}
      <table className="min-w-full table-auto border-collapse dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-2 text-left">No</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Roles</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Display loading indicator if data is loading */}
          {loading ? (
            <tr>
              <td colSpan={5} className="text-center">
                <span className="loading loading-dots loading-sm"></span>
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-4 py-2">{(currentPage - 1) * perPage + index + 1}</td>
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  {user.roles.map((role, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-2"
                    >
                      {role.name}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-2">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={() => openRoleModal(user)} // Open modal on click
                  >
                    Ubah Role
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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

      {/* Modal for changing role */}
      <dialog id="change_role_modal" className="modal">
        <div className="modal-box">
            <h3 className="font-bold text-lg">
            Ubah Role and Features for {selectedUser?.name || 'User'}
            </h3> 
            <div className="py-4">
            {/* Feature Selection */}
            <fieldset className="mb-4">
                <div className="flex flex-col space-y-2">
                {/* User Management */}
                <div className="form-control">
                    <label className="label cursor-pointer">
                    <span className="label-text">User Management</span>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={newRole.includes('user-management')}
                        onChange={() => handleRoleCheckboxChange('user-management')} // Handle change
                    />
                    </label>
                </div>
                {/* Master Item */}
                <div className="form-control">
                    <label className="label cursor-pointer">
                    <span className="label-text">Master Item</span>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={newRole.includes('master-item')}
                        onChange={() => handleRoleCheckboxChange('master-item')} // Handle change
                    />
                    </label>
                </div>
                {/* Office */}
                <div className="form-control">
                    <label className="label cursor-pointer">
                    <span className="label-text">Office</span>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={newRole.includes('office')}
                        onChange={() => handleRoleCheckboxChange('office')} // Handle change
                    />
                    </label>
                </div>
                </div>
            </fieldset>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end">
            <button onClick={closeModal} className="btn">Cancel</button>
            <button
              className={`btn btn-primary text-white mx-2 ${isSubmitting ? 'loading' : ''}`}
              onClick={saveUserRoles}
              disabled={isSubmitting} // Disable while saving
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            </div>
        </div>
        <form method="dialog" className="modal-backdrop">
            <button>close</button>
        </form>
        </dialog>

        {/* Add User Modal */}
        <dialog id="add_user_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Tambah User dan Role</h3>
          <div className='divider -mb-4'></div>
          <div className="py-4">
            {/* Name Input */}
            <div className="form-control mb-4">
              <label className="label">Name</label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Enter Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>

            {/* Email Input */}
            <div className="form-control mb-4">
              <label className="label">Email</label>
              <input
                type="email"
                className="input input-bordered"
                placeholder="Enter Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>

            {/* Password Input */}
            <div className="form-control mb-4">
              <label className="label">Password</label>
              <input
                type="password"
                className="input input-bordered"
                placeholder="Enter Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>

            {/* Role Checkboxes */}
            <fieldset className="mb-4">
              <div className="flex flex-col space-y-2">
                {/* User Management Role */}
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">User Management</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={newUser.roles.includes('user-management')}
                      onChange={() => handleRoleCheckboxChangeForAddUser('user-management')}
                    />
                  </label>
                </div>

                {/* Master Item Role */}
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Master Item</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={newUser.roles.includes('master-item')}
                      onChange={() => handleRoleCheckboxChangeForAddUser('master-item')}
                    />
                  </label>
                </div>

                {/* Office Role */}
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Office</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={newUser.roles.includes('office')}
                      onChange={() => handleRoleCheckboxChangeForAddUser('office')}
                    />
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button onClick={closeAddUserModal} className="btn">Cancel</button>
            <button className="btn btn-primary text-white mx-2" onClick={saveNewUser}>
              Save
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default TableUser;
