// src/pages/public/KioskPublicAccess.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQrcode, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../services/api';

const KioskPublicAccess = () => {
  const [selectedKiosk, setSelectedKiosk] = useState('');
  const [kiosks, setKiosks] = useState([]);
  const [emplacements, setEmplacements] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch kiosks and emplacements on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch kiosks and emplacements in parallel
        const [kiosksResponse, emplacementsResponse] = await Promise.all([
          api.get('/kiosks'),
          api.get('/emplacements')
        ]);

        setKiosks(kiosksResponse.data);
        setEmplacements(emplacementsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load kiosks or locations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter to show only online kiosks
  const availableKiosks = kiosks.filter(kiosk => kiosk.isonline);

  const getEmplacementName = (emplacementId) => {
    return emplacements.find(emp => emp.id === emplacementId)?.name || 'Unknown Location';
  };

  const handleNext = () => {
    if (!selectedKiosk) {
      setError('Please select a kiosk to continue');
      return;
    }
    
    setError('');
    navigate(`/kiosk/scanner/${selectedKiosk}`);
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
      <div className="card w-full max-w-md bg-white shadow-2xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="avatar placeholder mb-4">
              <div className="bg-primary text-primary-content rounded-full w-16">
                <FaQrcode className="text-2xl" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Access Control</h1>
            <p className="text-gray-600 mt-2">Select your kiosk location to proceed</p>
          </div>

          {/* Kiosk Selection */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">
                <FaMapMarkerAlt className="inline mr-2" />
                Select Kiosk Location
              </span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedKiosk}
              onChange={(e) => setSelectedKiosk(e.target.value)}
            >
              <option value="">Choose a kiosk...</option>
              {availableKiosks.map(kiosk => (
                <option key={kiosk.id} value={kiosk.id}>
                  {kiosk.id.substring(0, 8)}... - {getEmplacementName(kiosk.assignedemplacementid)}
                </option>
              ))}
            </select>
          </div>

          {/* No Available Kiosks Warning */}
          {availableKiosks.length === 0 && !loading && (
            <div className="alert alert-warning mt-4">
              <span className="text-sm">No kiosks are currently online. Please contact administrator.</span>
            </div>
          )}

          {/* Selected Kiosk Info */}
          {selectedKiosk && (
            <div className="bg-base-200 p-4 rounded-lg mt-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Selected Location:</h3>
              <p className="text-lg font-bold text-primary">
                {getEmplacementName(
                  kiosks.find(k => k.id === selectedKiosk)?.assignedemplacementid
                )}
              </p>
              <p className="text-sm text-gray-600 font-mono">
                Kiosk ID: {selectedKiosk}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mt-4">
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
            className="btn btn-primary mt-6 w-full"
            onClick={handleNext}
            disabled={!selectedKiosk || availableKiosks.length === 0}
          >
            <span>Proceed to Scanner</span>
            <FaArrowRight className="ml-2" />
          </button>

          {/* Status Info */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Available Kiosks: {availableKiosks.length} / {kiosks.length}
            </p>
          </div>

          {/* Retry Button if error occurred */}
          {error && (
            <button
              className="btn btn-ghost btn-sm mt-2 w-full"
              onClick={() => window.location.reload()}
            >
              Retry Loading
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KioskPublicAccess;
