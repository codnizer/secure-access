import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaTimes, FaQrcode, FaKey, FaCamera } from 'react-icons/fa';
import api from '../../services/api';

const EmplacementManagement = () => {
  const [emplacements, setEmplacements] = useState([]);
  const [filteredEmplacements, setFilteredEmplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingEmplacement, setEditingEmplacement] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    search: ''
  });

  const { logout } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
  name: '',
  type: '',
  accessMethod: {
    qr: true,  // Changed to true by default
    pin: false,
    photo: false
  },
  exitMethod: {
    qr: true,  // Changed to true by default
    pin: false,
    photo: false
  }
});

  // Available types
  const emplacementTypes = ['Office', 'Warehouse', 'Factory', 'Laboratory', 'Secure Area', 'Other'];

  // Fetch emplacements data
  const fetchEmplacements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/emplacements');
      setEmplacements(response.data);
      setFilteredEmplacements(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch emplacements');
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmplacements();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = emplacements;
    
    // Type filter
    if (filters.type !== 'all') {
      result = result.filter(emp => emp.type === filters.type);
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm) ||
        emp.type.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredEmplacements(result);
  }, [filters, emplacements]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('accessMethod.') || name.startsWith('exitMethod.')) {
      const [methodType, methodName] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [methodType]: {
          ...prev[methodType],
          [methodName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle form submission
// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  
  try {
    // Prepare the data for API - ensure QR code is always true
    const submissionData = {
      name: formData.name,
      type: formData.type,
      accessMethod: {
        ...formData.accessMethod,
        qr: true  // Force QR code to be true
      },
      exitMethod: {
        ...formData.exitMethod,
        qr: true  // Force QR code to be true
      }
    };
    
    const url = editingEmplacement ? `/emplacements/${editingEmplacement.id}` : '/emplacements';
      const method = editingEmplacement ? 'put' : 'post';
      
      const response = await api[method](url, submissionData);
      setSuccess(editingEmplacement ? 'Emplacement updated successfully' : 'Emplacement added successfully');
      setShowModal(false);
      setEditingEmplacement(null);
      setFormData({
        name: '',
        type: '',
        accessMethod: {
          qr: true,
          pin: false,
          photo: false
        },
        exitMethod: {
          qr: true,
          pin: false,
          photo: false
        }
      });
      
      fetchEmplacements(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Handle edit
// Handle edit
const handleEdit = (emp) => {
  setEditingEmplacement(emp);
  setFormData({
    name: emp.name,
    type: emp.type,
    accessMethod: {
      ...emp.accessmethod,
      qr: true  // Force QR code to be true
    },
    exitMethod: {
      ...emp.exitmethod,
      qr: true  // Force QR code to be true
    }
  });
  setViewMode(false);
  setShowModal(true);
};

  // Handle view
  const handleView = (emp) => {
    setEditingEmplacement(emp);
    setViewMode(true);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this emplacement?')) return;
    
    try {
      await api.delete(`/emplacements/${id}`);
      setSuccess('Emplacement deleted successfully');
      fetchEmplacements(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete emplacement');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Reset form and close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmplacement(null);
    setViewMode(false);
    setFormData({
      name: '',
      type: '',
      accessMethod: {
        qr: false,
        pin: false,
        photo: false
      },
      exitMethod: {
        qr: false,
        pin: false,
        photo: false
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Emplacement Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <FaPlus className="mr-2" /> Add Emplacement
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setError('')}>✕</button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success mb-6">
          <span>{success}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setSuccess('')}>✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-base-100 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Type</span>
            </label>
            <select 
              className="select select-bordered"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="all">All Types</option>
              {emplacementTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text">Search</span>
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by name or type..." 
                className="input input-bordered w-full pr-10"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              {filters.search && (
                <button 
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => setFilters({...filters, search: ''})}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emplacements Table */}
      <div className="bg-base-100 rounded-lg shadow-md overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Access Methods</th>
              <th>Exit Methods</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmplacements.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No emplacements found
                </td>
              </tr>
            ) : (
              filteredEmplacements.map(emp => (
                <tr key={emp.id}>
                  <td className="font-bold">{emp.name}</td>
                  <td>
                    <span className="badge badge-outline">{emp.type}</span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {emp.accessmethod?.qr && <span className="badge badge-info"><FaQrcode className="mr-1" /> QR</span>}
                      {emp.accessmethod?.pin && <span className="badge badge-warning"><FaKey className="mr-1" /> PIN</span>}
                      {emp.accessmethod?.photo && <span className="badge badge-success"><FaCamera className="mr-1" /> Photo</span>}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {emp.exitmethod?.qr && <span className="badge badge-info"><FaQrcode className="mr-1" /> QR</span>}
                      {emp.exitmethod?.pin && <span className="badge badge-warning"><FaKey className="mr-1" /> PIN</span>}
                      {emp.exitmethod?.photo && <span className="badge badge-success"><FaCamera className="mr-1" /> Photo</span>}
                    </div>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleView(emp)}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleEdit(emp)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => handleDelete(emp.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && !viewMode && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-2xl mb-6">
              {editingEmplacement ? 'Edit Emplacement' : 'Add New Emplacement'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Emplacement Name"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Type *</span>
                  </label>
                  <select
                    name="type"
                    className="select select-bordered"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Type</option>
                    {emplacementTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-bold">Access Methods *</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-base-200 rounded-lg">
                    <label className="label cursor-pointer justify-start">
  <input
    type="checkbox"
    name="accessMethod.qr"
    className="checkbox checkbox-primary mr-3"
    checked={true}  // Always checked
    onChange={() => {}}  // Empty function to prevent changes
    disabled  // Disable the checkbox
  />
  <span className="label-text flex items-center">
    <FaQrcode className="mr-2" /> QR Code
  </span>
</label>
                    
                    <label className="label cursor-pointer justify-start">
                      <input
                        type="checkbox"
                        name="accessMethod.pin"
                        className="checkbox checkbox-warning mr-3"
                        checked={formData.accessMethod.pin}
                        onChange={handleInputChange}
                      />
                      <span className="label-text flex items-center">
                        <FaKey className="mr-2" /> PIN Code
                      </span>
                    </label>
                    
                    <label className="label cursor-pointer justify-start">
                      <input
                        type="checkbox"
                        name="accessMethod.photo"
                        className="checkbox checkbox-success mr-3"
                        checked={formData.accessMethod.photo}
                        onChange={handleInputChange}
                      />
                      <span className="label-text flex items-center">
                        <FaCamera className="mr-2" /> Photo
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-bold">Exit Methods *</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-base-200 rounded-lg">
                    <label className="label cursor-pointer justify-start">
  <input
    type="checkbox"
    name="exitMethod.qr"
    className="checkbox checkbox-primary mr-3"
    checked={true}  // Always checked
    onChange={() => {}}  // Empty function to prevent changes
    disabled  // Disable the checkbox
  />
  <span className="label-text flex items-center">
    <FaQrcode className="mr-2" /> QR Code
  </span>
</label>
                    
                    <label className="label cursor-pointer justify-start">
                      <input
                        type="checkbox"
                        name="exitMethod.pin"
                        className="checkbox checkbox-warning mr-3"
                        checked={formData.exitMethod.pin}
                        onChange={handleInputChange}
                      />
                      <span className="label-text flex items-center">
                        <FaKey className="mr-2" /> PIN Code
                      </span>
                    </label>
                    
                    <label className="label cursor-pointer justify-start">
                      <input
                        type="checkbox"
                        name="exitMethod.photo"
                        className="checkbox checkbox-success mr-3"
                        checked={formData.exitMethod.photo}
                        onChange={handleInputChange}
                      />
                      <span className="label-text flex items-center">
                        <FaCamera className="mr-2" /> Photo
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  {editingEmplacement ? 'Update' : 'Add'} Emplacement
                </button>
                <button type="button" className="btn" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showModal && viewMode && editingEmplacement && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-2xl mb-6">Emplacement Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Name</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {editingEmplacement.name}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Type</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  <span className="badge badge-outline">{editingEmplacement.type}</span>
                </div>
              </div>
              
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-bold">Access Methods</span>
                </label>
                <div className="p-4 bg-base-200 rounded-lg">
                  <div className="flex flex-wrap gap-4">
                    {editingEmplacement.accessmethod?.qr && (
                      <span className="badge badge-info badge-lg">
                        <FaQrcode className="mr-2" /> QR Code
                      </span>
                    )}
                    {editingEmplacement.accessmethod?.pin && (
                      <span className="badge badge-warning badge-lg">
                        <FaKey className="mr-2" /> PIN Code
                      </span>
                    )}
                    {editingEmplacement.accessmethod?.photo && (
                      <span className="badge badge-success badge-lg">
                        <FaCamera className="mr-2" /> Photo
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-bold">Exit Methods</span>
                </label>
                <div className="p-4 bg-base-200 rounded-lg">
                  <div className="flex flex-wrap gap-4">
                    {editingEmplacement.exitmethod?.qr && (
                      <span className="badge badge-info badge-lg">
                        <FaQrcode className="mr-2" /> QR Code
                      </span>
                    )}
                    {editingEmplacement.exitmethod?.pin && (
                      <span className="badge badge-warning badge-lg">
                        <FaKey className="mr-2" /> PIN Code
                      </span>
                    )}
                    {editingEmplacement.exitmethod?.photo && (
                      <span className="badge badge-success badge-lg">
                        <FaCamera className="mr-2" /> Photo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-action">
              <button type="button" className="btn" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmplacementManagement;