import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaTimes, FaLink, FaUnlink, FaWifi } from 'react-icons/fa';
import api from '../../services/api';

const KioskManagement = () => {
  const [kiosks, setKiosks] = useState([]);
  const [filteredKiosks, setFilteredKiosks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingKiosk, setEditingKiosk] = useState(null);
  const [selectedKiosk, setSelectedKiosk] = useState(null);
  const [emplacements, setEmplacements] = useState([]);
  const [guards, setGuards] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    emplacement: 'all',
    search: ''
  });

  const { logout } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    assignedEmplacementId: ''
  });

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    guardid: ''
  });

  // Fetch kiosks data
  const fetchKiosks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/kiosks');
      setKiosks(response.data);
      setFilteredKiosks(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch kiosks');
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

  // Fetch guards for assignment dropdown
  const fetchGuards = async () => {
    try {
      const response = await api.get('/guards');
      console.log('Guards fetched:', response.data); // Debug log
      setGuards(response.data);
    } catch (err) {
      console.error('Error fetching guards:', err);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Fetch assignments
const fetchAssignments = async () => {
  try {
    console.log('Fetching assignments...'); // Debug log
    const response = await api.get('/guard-kiosk-assignments');
    console.log('Assignments response:', response.data); // Debug log
    
    if (response.data && Array.isArray(response.data)) {
      setAssignments(response.data);
      console.log('Assignments set successfully:', response.data , 'items');
    } else {
      console.error('Invalid assignments data format:', response.data);
      setAssignments([]);
    }
  } catch (err) {
    console.error('Error fetching assignments:', err);
    console.error('Error details:', err.response?.data);
    setError('Failed to fetch assignments: ' + (err.response?.data?.message || err.message));
    setAssignments([]); // Set empty array on error
    if (err.response?.status === 401) {
      logout();
    }
  }
};

  useEffect(() => {
    fetchKiosks();
    fetchEmplacements();
    fetchGuards();
    fetchAssignments();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = kiosks;
    
    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(kiosk => 
        filters.status === 'online' ? kiosk.isonline : !kiosk.isonline
      );
    }
    
    // Emplacement filter
    if (filters.emplacement !== 'all') {
      result = result.filter(kiosk => 
        kiosk.assignedemplacementid === filters.emplacement
      );
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(kiosk => 
        kiosk.id.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredKiosks(result);
  }, [filters, kiosks]);

  // Get assigned guards for a kiosk
const getAssignedGuards = (kioskId) => {
  console.log('=== Debug getAssignedGuards ===');
  console.log('Looking for kiosk:', kioskId);
  console.log('Available assignments:', assignments);
  console.log('Available guards:', guards);

  if (!assignments.length || !guards.length || !kioskId) {
    console.log('Missing data - returning empty array');
    return [];
  }

  // Filter assignments for this kiosk
  const kioskAssignments = assignments.filter(assignment => {
    console.log(`Comparing kioskdeviceid: "${assignment.kioskdeviceid}" === "${kioskId}"`);
    return assignment.kioskdeviceid === kioskId; // Exact match, no string conversion
  });
  
  console.log('Matching assignments for this kiosk:', kioskAssignments);

  // Map assignments to guards
  const matchedGuards = kioskAssignments.map(assignment => {
    console.log(`Looking for guard with ID: "${assignment.guardid}"`);
    
    const guard = guards.find(g => {
      console.log(`Comparing guard ID: "${g.id}" === "${assignment.guardid}"`);
      return g.id === assignment.guardid; // Exact match
    });
    
    console.log('Found guard:', guard);
    return guard ? { ...guard, assignmentId: assignment.id } : null;
  }).filter(Boolean);

  console.log('Final matched guards:', matchedGuards);
  console.log('=== End Debug ===');
  
  return matchedGuards;
};


  // Get available guards for assignment (not already assigned to this kiosk)
  const getAvailableGuards = (kioskId) => {
    const assignedguardids = assignments
      .filter(assignment => assignment.kioskdeviceid === kioskId)
      .map(assignment => assignment.guardid);
    
    return guards.filter(guard => !assignedguardids.includes(guard.id));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle assignment form changes
  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm(prev => ({
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
      const url = editingKiosk ? `/kiosks/${editingKiosk.id}` : '/kiosks';
      const method = editingKiosk ? 'put' : 'post';
      
      const response = await api[method](url, formData);
      setSuccess(editingKiosk ? 'Kiosk updated successfully' : 'Kiosk added successfully');
      setShowModal(false);
      setEditingKiosk(null);
      setFormData({
        assignedEmplacementId: ''
      });
      
      fetchKiosks(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Handle assignment submission
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await api.post('/guard-kiosk-assignments', {
        guardId: assignmentForm.guardid,
        kioskDeviceId: selectedKiosk.id
      });
      
      setSuccess('Guard assigned to kiosk successfully');
      setShowAssignmentModal(false);
      setSelectedKiosk(null);
      setAssignmentForm({
        guardid: ''
      });
      
      // Refresh data
      fetchKiosks();
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign guard');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Handle edit
  const handleEdit = (kiosk) => {
    setEditingKiosk(kiosk);
    setFormData({
      assignedEmplacementId: kiosk.assignedemplacementid || ''
    });
    setViewMode(false);
    setShowModal(true);
  };

  // Handle view
  const handleView = (kiosk) => {
    setEditingKiosk(kiosk);
    setViewMode(true);
    setShowModal(true);
  };

  // Handle assign
  const handleAssign = (kiosk) => {
    setSelectedKiosk(kiosk);
    setAssignmentForm({ guardid: '' }); // Reset form
    setShowAssignmentModal(true);
  };

  // Handle unassign
  const handleUnassign = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;
    
    try {
      await api.delete(`/guard-kiosk-assignments/${assignmentId}`);
      setSuccess('Assignment removed successfully');
      fetchAssignments();
      fetchKiosks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove assignment');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this kiosk?')) return;
    
    try {
      await api.delete(`/kiosks/${id}`);
      setSuccess('Kiosk deleted successfully');
      fetchKiosks(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete kiosk');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Handle online status update
  const handleOnlineStatus = async (kioskId, isOnline) => {
    try {
      await api.put(`/kiosks/${kioskId}/online`, { isOnline });
      setSuccess(`Kiosk marked as ${isOnline ? 'online' : 'offline'}`);
      fetchKiosks(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Reset form and close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingKiosk(null);
    setViewMode(false);
    setFormData({
      assignedEmplacementId: ''
    });
  };

  // Reset assignment form and close modal
  const handleCloseAssignmentModal = () => {
    setShowAssignmentModal(false);
    setSelectedKiosk(null);
    setAssignmentForm({
      guardid: ''
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
// Add this inside your component, just before the return statement
console.log('Debug Info:', {
  assignments: assignments,
  guards: guards,
  filteredKiosks: filteredKiosks,
  kioskAssignments: assignments.filter(a => a.kioskdeviceid === filteredKiosks[0]?.id),
  matchedGuards: assignments
    .filter(a => a.kioskdeviceid === filteredKiosks[0]?.id)
    .map(a => guards.find(g => g.id === a.guardid))
});

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kiosk Device Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <FaPlus className="mr-2" /> Add Kiosk
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
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
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
                placeholder="Search by ID..." 
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

      {/* Kiosks Table */}
      <div className="bg-base-100 rounded-lg shadow-md overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Kiosk ID</th>
              <th>Assigned Emplacement</th>
              <th>Status</th>
              <th>Assigned Guards</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredKiosks.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No kiosks found
                </td>
              </tr>
            ) : (
              filteredKiosks.map(kiosk => {
                const assignedGuards = getAssignedGuards(kiosk.id);
                
                return (
                  <tr key={kiosk.id}>
                    <td className="font-mono">{kiosk.id.substring(0, 8)}...</td>
                    <td>
                      {emplacements.find(emp => emp.id === kiosk.assignedemplacementid)?.name || 'Not assigned'}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span className={`badge ${kiosk.isonline ? 'badge-success' : 'badge-error'}`}>
                          {kiosk.isonline ? 'Online' : 'Offline'}
                        </span>
                        <button 
                          className="btn btn-ghost btn-xs ml-2"
                          onClick={() => handleOnlineStatus(kiosk.id, !kiosk.isonline)}
                          title={kiosk.isonline ? 'Mark as offline' : 'Mark as online'}
                        >
                          <FaWifi />
                        </button>
                      </div>
                    </td>
                    <td>
                      {assignedGuards.length > 0 ? (
                        <div className="space-y-1">
                          {assignedGuards.map(guard => (
                            <div key={guard.id} className="flex items-center justify-between p-1 bg-base-200 rounded text-sm">
                              <span>{guard.fname} {guard.lname}</span>
                              <button 
                                className="btn btn-xs btn-ghost text-error"
                                onClick={() => handleUnassign(guard.assignmentId)}
                                title="Remove assignment"
                              >
                                <FaUnlink />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No guards assigned</span>
                      )}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button 
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleView(kiosk)}
                          title="View details"
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleEdit(kiosk)}
                          title="Edit kiosk"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs text-info"
                          onClick={() => handleAssign(kiosk)}
                          title="Assign guard"
                        >
                          <FaLink />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => handleDelete(kiosk.id)}
                          title="Delete kiosk"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && !viewMode && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-2xl mb-6">
              {editingKiosk ? 'Edit Kiosk' : 'Add New Kiosk'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
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
                  {editingKiosk ? 'Update' : 'Add'} Kiosk
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
      {showModal && viewMode && editingKiosk && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-2xl mb-6">Kiosk Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Kiosk ID</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg font-mono">
                  {editingKiosk.id}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Status</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  <span className={`badge ${editingKiosk.isonline ? 'badge-success' : 'badge-error'}`}>
                    {editingKiosk.isonline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-bold">Assigned Emplacement</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {emplacements.find(emp => emp.id === editingKiosk.assignedemplacementid)?.name || 'Not assigned'}
                </div>
              </div>
              
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-bold">Assigned Guards</span>
                </label>
                <div className="p-2 bg-base-200 rounded-lg">
                  {(() => {
                    const assignedGuards = getAssignedGuards(editingKiosk.id);
                    
                    return assignedGuards.length > 0 ? (
                      <div className="space-y-2">
                        {assignedGuards.map(guard => (
                          <div key={guard.id} className="flex items-center justify-between p-2 bg-base-100 rounded">
                            <span>{guard.fname} {guard.lname}</span>
                            <button 
                              className="btn btn-xs btn-ghost text-error"
                              onClick={() => handleUnassign(guard.assignmentId)}
                              title="Remove assignment"
                            >
                              <FaUnlink />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm">No guards assigned</span>
                    );
                  })()}
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

      {/* Assignment Modal */}
      {showAssignmentModal && selectedKiosk && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-2xl mb-6">Assign Guard to Kiosk</h3>
            
            <div className="mb-4 p-4 bg-base-200 rounded-lg">
              <p className="font-bold">Kiosk ID: <span className="font-mono">{selectedKiosk.id.substring(0, 8)}...</span></p>
              <p>Emplacement: {emplacements.find(emp => emp.id === selectedKiosk.assignedemplacementid)?.name || 'Not assigned'}</p>
            </div>
            
            <form onSubmit={handleAssignmentSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Select Guard</span>
                  </label>
                  <select
                    name="guardid"
                    className="select select-bordered"
                    value={assignmentForm.guardid}
                    onChange={handleAssignmentChange}
                    required
                  >
                    <option value="">Select Guard</option>
                    {getAvailableGuards(selectedKiosk.id).map(guard => (
                      <option key={guard.id} value={guard.id}>
                        {guard.fname} {guard.lname}
                        {guard.phone && ` - ${guard.phone}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                {getAvailableGuards(selectedKiosk.id).length === 0 && (
                  <div className="alert alert-warning">
                    <span>All guards are already assigned to this kiosk.</span>
                  </div>
                )}
              </div>
              
              <div className="modal-action">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={getAvailableGuards(selectedKiosk.id).length === 0}
                >
                  <FaLink className="mr-2" /> Assign Guard
                </button>
                <button type="button" className="btn" onClick={handleCloseAssignmentModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskManagement;
