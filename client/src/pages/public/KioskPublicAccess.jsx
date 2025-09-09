import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQrcode, FaArrowRight, FaMapMarkerAlt, FaWifi, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

const KioskPublicAccess = () => {
  const [selectedKiosk, setSelectedKiosk] = useState('');
  const [kiosks, setKiosks] = useState([]);
  const [emplacements, setEmplacements] = useState([]);
  const [guardKioskAssignments, setGuardKioskAssignments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Helper function to get consistent ID access
  const getId = (obj) => obj.id || obj.ID || obj.deviceID;
  const getIsOnline = (obj) => obj.isonline || obj.isOnline || obj.online;
  const getAssignedEmplacementId = (obj) => obj.assignedemplacementid || obj.assignedEmplacementId || obj.assignedEmplacementID;

  // Fetch all necessary data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Updated API endpoint paths to match your backend routes
        const [kiosksResponse, emplacementsResponse, assignmentsResponse] = await Promise.all([
          api.get('/kiosks'), // Changed from '/kiosks' to match your backend
          api.get('/emplacements'),
          api.get('/guard-kiosk-assignments')
        ]);

        console.log('Kiosks data:', kiosksResponse.data); // Debug logging
        console.log('Emplacements data:', emplacementsResponse.data);
        console.log('Assignments data:', assignmentsResponse.data);

        setKiosks(kiosksResponse.data || []);
        setEmplacements(emplacementsResponse.data || []);
        setGuardKioskAssignments(assignmentsResponse.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        
        // More specific error handling
        if (err.response?.status === 404) {
          setError('API endpoint not found. Please check if the server is running and routes are configured.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please check the backend logs.');
        } else if (err.code === 'ERR_NETWORK') {
          setError('Network error. Please check if the API server is accessible.');
        } else {
          setError(err.response?.data?.message || 'Failed to load kiosk data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter to show only online kiosks
  const availableKiosks = kiosks.filter(kiosk => getIsOnline(kiosk));

  const getEmplacementName = (emplacementId) => {
    if (!emplacementId) return 'Unassigned Location';
    const emplacement = emplacements.find(emp => getId(emp) === emplacementId);
    return emplacement?.name || 'Unknown Location';
  };

  const getEmplacementType = (emplacementId) => {
    if (!emplacementId) return '';
    const emplacement = emplacements.find(emp => getId(emp) === emplacementId);
    return emplacement?.type || '';
  };

  // Get assigned guards for a kiosk
  const getAssignedGuards = (kioskId) => {
    return guardKioskAssignments.filter(assignment => 
      (assignment.kioskdeviceid || assignment.kioskDeviceId) === kioskId
    );
  };

  const handleNext = () => {
    if (!selectedKiosk) {
      setError('Please select a kiosk to continue');
      return;
    }
    
    const selectedKioskData = kiosks.find(k => getId(k) === selectedKiosk);
    if (!getIsOnline(selectedKioskData)) {
      setError('Selected kiosk is currently offline');
      return;
    }
    
    setError('');
    navigate(`/kiosk/scanner/${selectedKiosk}`);
  };

  const handleRefresh = async () => {
    setError('');
    setLoading(true);
    
    try {
      const [kiosksResponse, emplacementsResponse, assignmentsResponse] = await Promise.all([
        api.get('/kiosks'), // Updated endpoint
        api.get('/emplacements'),
        api.get('/guard-kiosk-assignments')
      ]);

      setKiosks(kiosksResponse.data || []);
      setEmplacements(emplacementsResponse.data || []);
      setGuardKioskAssignments(assignmentsResponse.data || []);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="card w-full max-w-md bg-white shadow-2xl">
          <div className="card-body text-center">
            <span className="loading loading-spinner loading-lg mb-4"></span>
            <p className="text-gray-600">Loading available kiosks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-white shadow-2xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="avatar placeholder mb-4">
              <div className="bg-primary text-primary-content rounded-full w-16">
                <FaQrcode className="text-2xl" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Access Control System</h1>
            <p className="text-gray-600 mt-2">Select your kiosk location to proceed</p>
          </div>

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 p-2 rounded mb-4 text-xs">
              <p>Debug: {kiosks.length} kiosks, {emplacements.length} emplacements loaded</p>
            </div>
          )}

          {/* Kiosk Selection */}
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text font-semibold">
                <FaMapMarkerAlt className="inline mr-2" />
                Select Kiosk Location
              </span>
              <button 
                className="btn btn-ghost btn-xs"
                onClick={handleRefresh}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedKiosk}
              onChange={(e) => setSelectedKiosk(e.target.value)}
              disabled={availableKiosks.length === 0}
            >
              <option value="">Choose a kiosk...</option>
              {availableKiosks.map(kiosk => (
                <option key={getId(kiosk)} value={getId(kiosk)}>
                  {getEmplacementName(getAssignedEmplacementId(kiosk))} - {getId(kiosk)?.substring(0, 8)}...
                </option>
              ))}
            </select>
          </div>

          {/* Kiosk Status Cards */}
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {kiosks.map(kiosk => (
              <div 
                key={getId(kiosk)}
                className={`card bg-base-200 shadow-sm cursor-pointer transition-all duration-200 ${
                  selectedKiosk === getId(kiosk) ? 'ring-2 ring-primary' : ''
                } ${!getIsOnline(kiosk) ? 'opacity-60' : ''}`}
                onClick={() => getIsOnline(kiosk) && setSelectedKiosk(getId(kiosk))}
              >
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm">
                          {getEmplacementName(getAssignedEmplacementId(kiosk))}
                        </h3>
                        {getIsOnline(kiosk) ? (
                          <span className="badge badge-success badge-sm">
                            <FaWifi className="mr-1" /> Online
                          </span>
                        ) : (
                          <span className="badge badge-error badge-sm">
                            <FaTimes className="mr-1" /> Offline
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 font-mono mb-2">
                        ID: {getId(kiosk)}
                      </p>
                      
                      {getEmplacementType(getAssignedEmplacementId(kiosk)) && (
                        <p className="text-xs text-gray-600 mb-2">
                          Type: {getEmplacementType(getAssignedEmplacementId(kiosk))}
                        </p>
                      )}

                      {/* Assigned Guards */}
                      {getAssignedGuards(getId(kiosk)).length > 0 && (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Guards: </span>
                          {getAssignedGuards(getId(kiosk)).length}
                        </div>
                      )}
                    </div>
                    
                    {selectedKiosk === getId(kiosk) && (
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Available Kiosks Warning */}
          {availableKiosks.length === 0 && !loading && kiosks.length > 0 && (
            <div className="alert alert-warning mb-4">
              <span className="text-sm">
                No kiosks are currently online. Please contact administrator or try refreshing.
              </span>
            </div>
          )}

          {/* No Kiosks Found */}
          {kiosks.length === 0 && !loading && (
            <div className="alert alert-info mb-4">
              <span className="text-sm">
                No kiosks found in the system. Please contact administrator to add kiosk devices.
              </span>
            </div>
          )}

          {/* Selected Kiosk Detailed Info */}
          {selectedKiosk && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-sm text-primary mb-2">Selected Kiosk:</h3>
              {(() => {
                const kiosk = kiosks.find(k => getId(k) === selectedKiosk);
                const assignedGuards = getAssignedGuards(selectedKiosk);
                
                return (
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-primary">
                      {getEmplacementName(getAssignedEmplacementId(kiosk))}
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      Type: {getEmplacementType(getAssignedEmplacementId(kiosk))}
                    </p>
                    
                    <p className="text-sm text-gray-600 font-mono">
                      Kiosk ID: {selectedKiosk}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${getIsOnline(kiosk) ? 'badge-success' : 'badge-error'} badge-sm`}>
                        {getIsOnline(kiosk) ? 'Online' : 'Offline'}
                      </span>
                      
                      {assignedGuards.length > 0 && (
                        <span className="badge badge-info badge-sm">
                          {assignedGuards.length} Guard{assignedGuards.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-4">
              <span className="text-sm">{error}</span>
              <button 
                className="btn btn-sm btn-ghost ml-auto" 
                onClick={() => setError('')}
              >
                ✕
              </button>
            </div>
          )}

          {/* Next Button */}
          <button
            className="btn btn-primary w-full mb-4"
            onClick={handleNext}
            disabled={!selectedKiosk || availableKiosks.length === 0 || loading}
          >
            <span>Proceed to Scanner</span>
            <FaArrowRight className="ml-2" />
          </button>

          {/* Status Info */}
          <div className="stats stats-vertical sm:stats-horizontal w-full">
            <div className="stat py-2 px-3">
              <div className="stat-title text-xs">Total Kiosks</div>
              <div className="stat-value text-sm">{kiosks.length}</div>
            </div>
            
            <div className="stat py-2 px-3">
              <div className="stat-title text-xs">Online</div>
              <div className="stat-value text-sm text-success">{availableKiosks.length}</div>
            </div>
            
            <div className="stat py-2 px-3">
              <div className="stat-title text-xs">Offline</div>
              <div className="stat-value text-sm text-error">{kiosks.length - availableKiosks.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskPublicAccess;
