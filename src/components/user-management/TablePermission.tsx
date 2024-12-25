/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { fetchPermissions, addPermission, updatePermission, deletePermission } from '@/api/user-management/permissions'; // Import the functions

const PermissionsTable: React.FC = () => {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({ name: '', description: '' });
  const [selectedPermission, setSelectedPermission] = useState<any>(null);

  const [actionStatus, setActionStatus] = useState<string | null>(null); // New state for tracking the action status (add, edit, delete)

  const page = 1;
  const query = '';
  const perPage = 5;

  useEffect(() => {
    const getPermissions = async () => {
      setLoading(true);
      try {
        const response = await fetchPermissions(page, query, perPage);
        setPermissions(response.data);
      } catch (err) {
        setError('Failed to fetch permissions');
      } finally {
        setLoading(false);
      }
    };

    getPermissions();
  }, [page, query, perPage]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle add permission form submit
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      name: formData.name ? '' : 'Nama permission harus diisi.',
      description: '',
    };

    if (!formData.name) {
      setFormErrors(errors);
      return;
    }

    setActionStatus('submitting'); // Set the action status to "submitting"
    
    try {
      const response = await addPermission(formData);
      if (response.success) {
        setPermissions((prevPermissions) => [...prevPermissions, response.data]);
        setShowAddModal(false);
        setFormData({ name: '', description: '' });
        setActionStatus(null); // Reset the action status after success
      }
    } catch (err) {
      setError('Failed to add permission');
      setActionStatus(null); // Reset the action status after failure
    }
  };

  // Handle edit permission form submit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      name: formData.name ? '' : 'Name is required',
      description: '',
    };

    if (!formData.name) {
      setFormErrors(errors);
      return;
    }

    setActionStatus('updating'); // Set the action status to "updating"
    
    try {
      const response = await updatePermission(selectedPermission.id, formData);
      if (response.success) {
        setPermissions((prevPermissions) =>
          prevPermissions.map((perm) =>
            perm.id === selectedPermission.id ? response.data : perm
          )
        );
        setShowEditModal(false);
        setFormData({ name: '', description: '' });
        setSelectedPermission(null);
        setActionStatus(null); // Reset the action status after success
      }
    } catch (err) {
      setError('Failed to update permission');
      setActionStatus(null); // Reset the action status after failure
    }
  };

  // Handle delete permission
  const handleDelete = async () => {
    if (!selectedPermission) return;

    setActionStatus('deleting'); // Set the action status to "deleting"
    
    try {
      const response = await deletePermission(selectedPermission.id);
      if (response.success) {
        setPermissions((prevPermissions) =>
          prevPermissions.filter((perm) => perm.id !== selectedPermission.id)
        );
        setShowDeleteModal(false);
        setSelectedPermission(null);
        setActionStatus(null); // Reset the action status after success
      }
    } catch (err) {
      setError('Failed to delete permission');
      setActionStatus(null); // Reset the action status after failure
    }
  };

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={() => setShowAddModal(true)}
        className="mb-4 text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
      >
        Tambah Permission
      </button>

      {/* Add Permission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box">
              <h2 className="text-xl font-semibold mb-4">Tambah Permission</h2>
              <form onSubmit={handleSubmitAdd}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-semibold">
                    Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-semibold">
                    Deskripsi (opsional)
                  </label>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="modal-action">
                  <button type="button" className="btn" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${actionStatus === 'submitting' ? 'animate-pulse' : ''}`}
                    disabled={actionStatus === 'submitting'}
                  >
                    {actionStatus === 'submitting' ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permission Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box">
              <h2 className="text-xl font-semibold mb-4">Edit Permission</h2>
              <form onSubmit={handleSubmitEdit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-semibold">
                    Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-semibold">
                    Deskripsi (opsional)
                  </label>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="modal-action">
                  <button type="button" className="btn" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${actionStatus === 'updating' ? 'animate-pulse' : ''}`}
                    disabled={actionStatus === 'updating'}
                  >
                    {actionStatus === 'updating' ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Permission Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box">
              <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this permission?</h2>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn btn-danger ${actionStatus === 'deleting' ? 'animate-pulse' : ''}`}
                  onClick={handleDelete}
                  disabled={actionStatus === 'deleting'}
                >
                  {actionStatus === 'deleting' ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">No</th>
            <th scope="col" className="px-6 py-3">Name</th>
            <th scope="col" className="px-6 py-3">Desc</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} className="text-center">
                <span className="loading loading-dots loading-sm"></span>
              </td>
            </tr>
          ) : permissions.length > 0 ? (
            permissions.map((permission, index) => (
              <tr key={permission.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {index + 1}
                </th>
                <td className="px-6 py-4 font-semibold">{permission.name}</td>
                <td className="px-6 py-4 font-semibold">{permission.description}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedPermission(permission);
                      setFormData({ name: permission.name, description: permission.description || '' });
                      setShowEditModal(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPermission(permission);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center py-4">No permissions found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionsTable;
