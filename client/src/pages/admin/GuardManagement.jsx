import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUserPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

const GuardManagement = () => {
  const [guards, setGuards] = useState([]);
  const [filteredGuards, setFilteredGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingGuard, setEditingGuard] = useState(null);
  const [emplacements, setEmplacements] = useState([]);
  const [filters, setFilters] = useState({
    emplacement: 'all',
    search: ''
  });

  const { logout } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    assignedEmplacementId: '',
    phone: ''
  });

  // Fetch guards data
  const fetchGuards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/guards');
      setGuards(response.data);
      setFilteredGuards(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch guards');
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch emplacements for dropdown
  const fetchEmplacements = async () => {
    try {
      const response = await api.get('/emplacements');
      setEmplacements(response.data);
    } catch (err) {
      console.error('Error fetching emplacements:', err);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    fetchGuards();
    fetchEmplacements();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = guards;
    
    // Emplacement filter
    if (filters.emplacement !== 'all') {
      result = result.filter(guard => 
        guard.assignedemplacementid === filters.emplacement
      );
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(guard => 
        guard.fname.toLowerCase().includes(searchTerm) ||
        guard.lname.toLowerCase().includes(searchTerm) ||
        guard.phone.includes(searchTerm)
      );
    }
    
    setFilteredGuards(result);
  }, [filters, guards]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const url = editingGuard ? `/guards/${editingGuard.id}` : '/guards';
      const method = editingGuard ? 'put' : 'post';
      
      const response = await api[method](url, formData);
      setSuccess(editingGuard ? 'Guard updated successfully' : 'Guard added successfully');
      setShowModal(false);
      setEditingGuard(null);
      setFormData({
        fname: '',
        lname: '',
        assignedEmplacementId: '',
        phone: ''
      });
      
      fetchGuards(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Handle edit
  const handleEdit = (guard) => {
    setEditingGuard(guard);
    setFormData({
      fname: guard.fname,
      lname: guard.lname,
      assignedEmplacementId: guard.assignedemplacementid || '',
      phone: guard.phone || ''
    });
    setViewMode(false);
    setShowModal(true);
  };

  // Handle view
  const handleView = (guard) => {
    setEditingGuard(guard);
    setViewMode(true);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guard?')) return;
    
    try {
      await api.delete(`/guards/${id}`);
      setSuccess('Guard deleted successfully');
      fetchGuards(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete guard');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Reset form and close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGuard(null);
    setViewMode(false);
    setFormData({
      fname: '',
      lname: '',
      assignedEmplacementId: '',
      phone: ''
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
        <h1 className="text-3xl font-bold">Guard Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <FaUserPlus className="mr-2" /> Add Guard
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
              <span className="label-text">Emplacement</span>
            </label>
            <select 
              className="select select-bordered"
              value={filters.emplacement}
              onChange={(e) => setFilters({...filters, emplacement: e.target.value})}
            >
              <option value="all">All Emplacements</option>
              {emplacements.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
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
                placeholder="Search by name or phone..." 
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

      {/* Guards Table */}
      <div className="bg-base-100 rounded-lg shadow-md overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Assigned Emplacement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuards.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  No guards found
                </td>
              </tr>
            ) : (
              filteredGuards.map(guard => (
                <tr key={guard.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar placeholder">
                        <div className="bg-neutral-focus text-neutral-content mask mask-squircle w-12 h-12">
                          <span className="text-xl">{guard.fname.charAt(0)}{guard.lname.charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{guard.fname} {guard.lname}</div>
                      </div>
                    </div>
                  </td>
                  <td>{guard.phone || 'N/A'}</td>
                  <td>
                    {emplacements.find(emp => emp.id === guard.assignedemplacementid)?.name || 'Not assigned'}
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleView(guard)}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleEdit(guard)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => handleDelete(guard.id)}
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
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-2xl mb-6">
              {editingGuard ? 'Edit Guard' : 'Add New Guard'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">First Name *</span>
                  </label>
                  <input
                    type="text"
                    name="fname"
                    placeholder="First Name"
                    className="input input-bordered"
                    value={formData.fname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Last Name *</span>
                  </label>
                  <input
                    type="text"
                    name="lname"
                    placeholder="Last Name"
                    className="input input-bordered"
                    value={formData.lname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    className="input input-bordered"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Assigned Emplacement</span>
                  </label>
                  <select
                    name="assignedEmplacementId"
                    className="select select-bordered"
                    value={formData.assignedEmplacementId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Emplacement</option>
                    {emplacements.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  {editingGuard ? 'Update' : 'Add'} Guard
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
      {showModal && viewMode && editingGuard && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-2xl mb-6">Guard Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2 flex justify-center">
                <div className="avatar placeholder">
                  <div className="bg-neutral-focus text-neutral-content mask mask-squircle w-24 h-24">
                    <span className="text-3xl">{editingGuard.fname.charAt(0)}{editingGuard.lname.charAt(0)}</span>
                  </div>
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">First Name</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {editingGuard.fname}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Last Name</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {editingGuard.lname}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Phone</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {editingGuard.phone || 'N/A'}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Assigned Emplacement</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {emplacements.find(emp => emp.id === editingGuard.assignedemplacementid)?.name || 'Not assigned'}
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

export default GuardManagement;