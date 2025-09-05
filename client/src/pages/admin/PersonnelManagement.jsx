import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUserPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaTimes, FaQrcode, FaKey } from 'react-icons/fa';
import api from '../../services/api';

const PersonnelManagement = () => {
  const [personnel, setPersonnel] = useState([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [emplacements, setEmplacements] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    emplacement: 'all',
    search: ''
  });

  const { user, logout } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    national_id: '',
    fname: '',
    lname: '',
    photoUrl: '',
    photoEmbeddings: '',
     
    phone: '',
    service: '',
    isActive: true
  });

  // Fetch personnel data
  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const response = await api.get('/personnel');
      setPersonnel(response.data);
      setFilteredPersonnel(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch personnel');
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
    fetchPersonnel();
    fetchEmplacements();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = personnel;
    
    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(person => 
        filters.status === 'active' ? person.isactive : !person.isactive
      );
    }
    
    // Emplacement filter
    if (filters.emplacement !== 'all') {
      result = result.filter(person => 
        person.assignedemplacementid === filters.emplacement
      );
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(person => 
        person.fname.toLowerCase().includes(searchTerm) ||
        person.lname.toLowerCase().includes(searchTerm) ||
        person.national_id.includes(searchTerm)
      );
    }
    
    setFilteredPersonnel(result);
  }, [filters, personnel]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/personnel/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormData(prev => ({ 
        ...prev, 
        photoUrl: response.data.imageUrl,
        photoEmbeddings: JSON.stringify(response.data.embeddings)
      }));
      setSuccess('Image uploaded successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Format the data for the API
      const submissionData = {
        national_id: formData.national_id,
        fname: formData.fname,
        lname: formData.lname,
        photoUrl: formData.photoUrl,
        photoEmbeddings: formData.photoEmbeddings,
         
        phone: formData.phone,
        service: formData.service,
        isActive: formData.isActive
      };
      console.log(submissionData)
      const url = editingPerson ? `/personnel/${editingPerson.id}` : '/personnel';
      const method = editingPerson ? 'put' : 'post';
      
      const response = await api[method](url, submissionData);
      setSuccess(editingPerson ? 'Personnel updated successfully' : 'Personnel added successfully');
      setShowModal(false);
      setEditingPerson(null);
      setFormData({
        national_id: '',
        fname: '',
        lname: '',
        photoUrl: '',
        photoEmbeddings: '',
       
        phone: '',
        service: '',
        isActive: true
      });
      
      fetchPersonnel(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Handle edit
  const handleEdit = (person) => {
    setEditingPerson(person);
    setFormData({
      national_id: person.national_id,
      fname: person.fname,
      lname: person.lname,
      photoUrl: person.photourl,
      photoEmbeddings: person.photoembeddings,
      
      phone: person.phone,
      service: person.service,
      isActive: person.isactive
    });
    setViewMode(false);
    setShowModal(true);
  };

  // Handle view
  const handleView = (person) => {
    setEditingPerson(person);
    setViewMode(true);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this personnel?')) return;
    
    try {
      await api.delete(`/personnel/${id}`);
      setSuccess('Personnel deleted successfully');
      fetchPersonnel(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete personnel');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Reset form and close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPerson(null);
    setViewMode(false);
    setFormData({
      national_id: '',
      fname: '',
      lname: '',
      photoUrl: '',
      photoEmbeddings: '',
     
      phone: '',
      service: '',
      isActive: true
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
        <h1 className="text-3xl font-bold">Personnel Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <FaUserPlus className="mr-2" /> Add Personnel
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
              <span className="label-text">Status</span>
            </label>
            <select 
              className="select select-bordered"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
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
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search</span>
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
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

      {/* Personnel Table */}
      <div className="bg-base-100 rounded-lg shadow-md overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>National ID</th>
              <th>Service</th>
              <th>Phone</th>
              <th>Status</th>
              
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersonnel.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No personnel found
                </td>
              </tr>
            ) : (
              filteredPersonnel.map(person => (
                <tr key={person.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <img src={person.photourl || '/default-avatar.png'} alt={person.fname} />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{person.fname} {person.lname}</div>
                      </div>
                    </div>
                  </td>
                  <td>{person.national_id}</td>
                  <td>{person.service}</td>
                  <td>{person.phone}</td>
                  <td>
                    <span className={`badge ${person.isactive ? 'badge-success' : 'badge-error'}`}>
                      {person.isactive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  
                  <td>
                    <div className="flex space-x-2">
                      <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleView(person)}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleEdit(person)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => handleDelete(person.id)}
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
              {editingPerson ? 'Edit Personnel' : 'Add New Personnel'}
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
                    <span className="label-text">National ID *</span>
                  </label>
                  <input
                    type="text"
                    name="national_id"
                    placeholder="National ID"
                    className="input input-bordered"
                    value={formData.national_id}
                    onChange={handleInputChange}
                    required
                    disabled={editingPerson}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone *</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    className="input input-bordered"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Service *</span>
                  </label>
                  <input
                    type="text"
                    name="service"
                    placeholder="Service"
                    className="input input-bordered"
                    value={formData.service}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      name="isActive"
                      className="toggle toggle-primary mr-3"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span className="label-text">{formData.isActive ? 'Active' : 'Inactive'}</span>
                  </label>
                </div>
                
                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Photo *</span>
                  </label>
                  {formData.photoUrl && (
                    <div className="mb-4">
                      <img 
                        src={formData.photoUrl} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input file-input-bordered w-full"
                    onChange={handleImageUpload}
                    required={!formData.photoUrl}
                  />
                  {formData.photoEmbeddings && (
                    <div className="mt-2 text-sm text-success">
                      Photo processed successfully. Embeddings are ready.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  {editingPerson ? 'Update' : 'Add'} Personnel
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
      {showModal && viewMode && editingPerson && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-2xl mb-6">Personnel Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2 flex justify-center">
                <div className="avatar">
                  <div className="mask mask-squircle w-32 h-32">
                    <img src={editingPerson.photourl || '/default-avatar.png'} alt={editingPerson.fname} />
                  </div>
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">First Name</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {editingPerson.fname}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Last Name</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {editingPerson.lname}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">National ID</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {editingPerson.national_id}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Phone</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {editingPerson.phone}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Service</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {editingPerson.service}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Status</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  <span className={`badge ${editingPerson.isactive ? 'badge-success' : 'badge-error'}`}>
                    {editingPerson.isactive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold flex items-center">
                    <FaQrcode className="mr-2" /> QR Code
                  </span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg break-all">
                  {editingPerson.qrcode}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold flex items-center">
                    <FaKey className="mr-2" /> PIN Code
                  </span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg font-mono">
                  {editingPerson.pin}
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

export default PersonnelManagement;