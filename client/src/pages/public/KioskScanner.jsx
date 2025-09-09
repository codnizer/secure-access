// src/pages/public/KioskScanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCamera, FaArrowLeft, FaUser, FaLock, FaQrcode, FaKeyboard, FaCheck } from 'react-icons/fa';
import { Scanner } from '@yudiel/react-qr-scanner';
import PinEntry from './PinEntry';
import CameraCapture from '../../components/CameraCapture'; // Import the new component
import api from '../../services/api';

const KioskScanner = () => {
  const { kioskId } = useParams();
  const navigate = useNavigate();
  
  const [scanMode, setScanMode] = useState(null); // Current authentication method
  const [currentEmplacement, setCurrentEmplacement] = useState(null);
  const [scannedUser, setScannedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [accessType, setAccessType] = useState('access'); // 'access' or 'exit'
  const [qrPaused, setQrPaused] = useState(false);
  
  // Multi-factor authentication state
  const [authFlow, setAuthFlow] = useState({
    personnel: null,
    completedMethods: [], // Track which methods have been completed
    requiredMethods: [], // Methods required for this access type
    currentMethodIndex: 0, // Current step in the auth flow
    isComplete: false
  });

  // Fetch kiosk and emplacement data
  useEffect(() => {
    const fetchKioskData = async () => {
      try {
        setLoading(true);
        const kioskResponse = await api.get(`/kiosks/${kioskId}`);
        const kiosk = kioskResponse.data;
        
        if (!kiosk.isonline) {
          setError('This kiosk is currently offline');
          return;
        }

        if (!kiosk.assignedemplacementid) {
          setError('This kiosk is not assigned to any location');
          return;
        }

        const emplacementResponse = await api.get(`/emplacements/${kiosk.assignedemplacementid}`);
        setCurrentEmplacement(emplacementResponse.data);
        
        // Initialize authentication flow
        initializeAuthFlow(emplacementResponse.data, 'access');
        
      } catch (err) {
        console.error('Error fetching kiosk data:', err);
        setError('Failed to load kiosk information');
      } finally {
        setLoading(false);
      }
    };

    if (kioskId) {
      fetchKioskData();
    }
  }, [kioskId]);

  // Initialize authentication flow based on access methods
  const initializeAuthFlow = (emplacement, type) => {
    if (!emplacement || !emplacement.accessmethod || !emplacement.exitmethod) {
      console.error('Invalid emplacement data:', emplacement);
      setError('Invalid location configuration');
      return;
    }

    const methods = type === 'access' ? emplacement.accessmethod : emplacement.exitmethod;
    const requiredMethods = Object.entries(methods)
      .filter(([key, value]) => value)
      .map(([key]) => key);

    console.log('Initializing auth flow with methods:', requiredMethods);

    if (requiredMethods.length === 0) {
      setError('No authentication methods configured for this location');
      return;
    }

    // CLEAN STATE INITIALIZATION - Always start fresh
    setAuthFlow({
      personnel: null,
      completedMethods: [], // Always start with empty array
      requiredMethods,
      currentMethodIndex: 0,
      isComplete: false
    });

    // Set initial scan mode
    setScanMode(requiredMethods[0]);
  };

  // Handle QR code scanning
  const handleQRScan = async (qrData) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      setQrPaused(true);
      setError('');
      
      console.log('QR Scanned:', qrData);
      
      const personnelResponse = await api.get(`/personnel/qr/${qrData}`);
      const personnel = personnelResponse.data;
      
      // Check access permissions
      const hasAccessResponse = await api.get(`/personnel-emplacements/check-access`, {
        params: {
          personnelId: personnel.id,
          emplacementId: currentEmplacement.id
        }
      });

      if (!hasAccessResponse.data.hasAccess) {
        setError('Access denied. You do not have permission to access this location.');
        return;
      }

      if (hasAccessResponse.data.isExpired) {
        setError('Access denied. Your access to this location has expired.');
        return;
      }

      await handleAuthMethodSuccess(personnel, 'qr');
      
    } catch (err) {
      console.error('QR scan error:', err);
      setError(err.response?.data?.message || 'QR code not recognized');
    } finally {
      setProcessing(false);
      setTimeout(() => setQrPaused(false), 2000);
    }
  };

  // Handle PIN entry
  const handlePinEntry = async (enteredPin) => {
    try {
      setProcessing(true);
      setError('');
      
      // If we already have personnel from previous method, verify PIN matches
      if (authFlow.personnel) {
        if (authFlow.personnel.pin !== enteredPin) {
          setError('PIN does not match the authenticated user.');
          return;
        }
        await handleAuthMethodSuccess(authFlow.personnel, 'pin');
      } else {
        // First method - find personnel by PIN
        const personnelResponse = await api.get(`/personnel/pin/${enteredPin}`);
        const personnel = personnelResponse.data;
        
        // Check access permissions
        const hasAccessResponse = await api.get(`/personnel-emplacements/check-access`, {
          params: {
            personnelId: personnel.id,
            emplacementId: currentEmplacement.id
          }
        });

        if (!hasAccessResponse.data.hasAccess || hasAccessResponse.data.isExpired) {
          setError('Access denied or expired.');
          return;
        }

        await handleAuthMethodSuccess(personnel, 'pin');
      }
      
    } catch (err) {
      console.error('PIN verification error:', err);
      setError('Invalid PIN or access denied');
    } finally {
      setProcessing(false);
    }
  };

  // Handle camera capture - UPDATED TO USE CAMERA CAPTURE
  const handleCameraCapture = async (file) => {
    try {
      setProcessing(true);
      setError('');
      
      const formData = new FormData();
      formData.append('image', file);
      
      const verifyResponse = await api.post('/personnel/verify-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const personnel = verifyResponse.data.personnel;
      
      // If we already have personnel from previous method, verify it's the same person
      if (authFlow.personnel && authFlow.personnel.id !== personnel.id) {
        setError('Face recognition does not match the authenticated user.');
        return;
      }

      // If this is the first method, check access permissions
      if (!authFlow.personnel) {
        const hasAccessResponse = await api.get(`/personnel-emplacements/check-access`, {
          params: {
            personnelId: personnel.id,
            emplacementId: currentEmplacement.id
          }
        });

        if (!hasAccessResponse.data.hasAccess || hasAccessResponse.data.isExpired) {
          setError('Access denied or expired.');
          return;
        }
      }

      await handleAuthMethodSuccess(personnel, 'photo');
      
    } catch (err) {
      console.error('Photo verification error:', err);
      setError(err.response?.data?.message || 'Face recognition failed');
    } finally {
      setProcessing(false);
    }
  };

  // Handle successful authentication method - COMPLETELY FIXED
  const handleAuthMethodSuccess = async (personnel, method) => {
    // Add safety check for method parameter
    if (!method || typeof method !== 'string') {
      console.error('Invalid method passed to handleAuthMethodSuccess:', method);
      setError('Authentication method error. Please try again.');
      return;
    }

    // PREVENT DUPLICATE METHOD COMPLETIONS
    if (authFlow.completedMethods.includes(method)) {
      console.log('Method already completed:', method);
      return; // Exit early to prevent duplicates
    }

    // ENSURE WE DON'T EXCEED REQUIRED METHODS
    if (authFlow.completedMethods.length >= authFlow.requiredMethods.length) {
      console.log('All methods already completed');
      await grantAccess(personnel, authFlow.completedMethods);
      return;
    }

    const newCompletedMethods = [...authFlow.completedMethods, method];
    
    // Update auth flow state
    const newAuthFlow = {
      ...authFlow,
      personnel,
      completedMethods: newCompletedMethods,
      currentMethodIndex: newCompletedMethods.length
    };

    console.log('Auth Flow Update:', {
      method,
      completedBefore: authFlow.completedMethods.length,
      completedAfter: newCompletedMethods.length,
      required: authFlow.requiredMethods.length,
      newCompleted: newCompletedMethods
    });

    setAuthFlow(newAuthFlow);

    // Check if all required methods are completed
    if (newCompletedMethods.length >= authFlow.requiredMethods.length) {
      // All methods completed - grant access
      newAuthFlow.isComplete = true;
      setAuthFlow(newAuthFlow);
      await grantAccess(personnel, newCompletedMethods);
    } else {
      // Find next uncompleted method
      const nextMethod = authFlow.requiredMethods.find(reqMethod => 
        !newCompletedMethods.includes(reqMethod)
      );
      
      if (!nextMethod) {
        console.error('No next method found. Required:', authFlow.requiredMethods, 'Completed:', newCompletedMethods);
        await grantAccess(personnel, newCompletedMethods);
        return;
      }

      console.log('Next method to complete:', nextMethod);
      setScanMode(nextMethod);
      setSuccess(`${method.toUpperCase()} verified! Please complete ${nextMethod.toUpperCase()} authentication.`);
      setQrPaused(false);
    }
  };

  // Grant access and log the entry
  const grantAccess = async (personnel, completedMethods) => {
    try {
      // Log the access request with all completed methods
      const methodsObj = {};
      completedMethods.forEach(method => {
        if (method && typeof method === 'string') {
          methodsObj[method] = true;
        }
      });

      await api.post('/requests', {
        type: accessType,
        personnelId: personnel.id,
        emplacementId: currentEmplacement.id,
        method: methodsObj,
        success: true
      });

      setSuccess(`${accessType === 'access' ? 'Access' : 'Exit'} granted! Welcome, ${personnel.fname} ${personnel.lname}`);
      
      // Reset after 3 seconds
      setTimeout(() => {
        resetScanner();
      }, 3000);
      
    } catch (err) {
      console.error('Error logging access:', err);
      setError('Access verification successful but logging failed');
    }
  };

  // Reset scanner and authentication flow
  const resetScanner = () => {
    setScannedUser(null);
    setError('');
    setSuccess('');
    setProcessing(false);
    setQrPaused(false);
    
    // Clear any existing timeouts
    if (window.resetTimeout) {
      clearTimeout(window.resetTimeout);
    }
    
    if (currentEmplacement) {
      initializeAuthFlow(currentEmplacement, accessType);
    }
  };

  // Handle access type change
  const handleAccessTypeChange = (newType) => {
    setAccessType(newType);
    setError('');
    setSuccess('');
    setScannedUser(null);
    setQrPaused(false);
    
    if (currentEmplacement) {
      initializeAuthFlow(currentEmplacement, newType);
    }
  };

  // Get authentication progress info
  const getAuthProgress = () => {
    if (authFlow.requiredMethods.length <= 1) return null;
    
    return {
      current: authFlow.completedMethods.length,
      total: authFlow.requiredMethods.length,
      completed: authFlow.completedMethods,
      remaining: authFlow.requiredMethods.filter(method => 
        !authFlow.completedMethods.includes(method)
      )
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="card w-full max-w-lg bg-white shadow-2xl">
          <div className="card-body text-center">
            <span className="loading loading-spinner loading-lg mb-4"></span>
            <p>Loading kiosk information...</p>
          </div>
        </div>
      </div>
    );
  }

  const authProgress = getAuthProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-white shadow-2xl">
        <div className="card-body">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/kiosk')}
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold">{currentEmplacement?.name}</h1>
              <p className="text-sm text-gray-600">{currentEmplacement?.type}</p>
            </div>
            <div></div>
          </div>

          {/* Access/Exit Toggle */}
          <div className="flex justify-center mb-6">
            <div className="btn-group">
              <button 
                className={`btn btn-sm ${accessType === 'access' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleAccessTypeChange('access')}
                disabled={processing || authFlow.completedMethods.length > 0}
              >
                Access
              </button>
              <button 
                className={`btn btn-sm ${accessType === 'exit' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleAccessTypeChange('exit')}
                disabled={processing || authFlow.completedMethods.length > 0}
              >
                Exit
              </button>
            </div>
          </div>

          {/* Multi-Factor Authentication Progress */}
          {authProgress && (
            <div className="bg-base-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-sm mb-3">Authentication Progress</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Step {authProgress.current + 1} of {authProgress.total}</span>
                <span className="text-sm">{Math.round((authProgress.current / authProgress.total) * 100)}%</span>
              </div>
              <progress 
                className="progress progress-primary w-full mb-3" 
                value={authProgress.current} 
                max={authProgress.total}
              ></progress>
              
              <div className="flex flex-wrap gap-2">
                {authFlow.requiredMethods.map((method, index) => (
                  <span 
                    key={method}
                    className={`badge badge-sm ${
                      authFlow.completedMethods.includes(method) 
                        ? 'badge-success' 
                        : index === authFlow.currentMethodIndex 
                          ? 'badge-primary' 
                          : 'badge-outline'
                    }`}
                  >
                    {authFlow.completedMethods.includes(method) && <FaCheck className="mr-1" />}
                    {method ? method.toUpperCase() : 'UNKNOWN'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Current Authentication Method Display */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold">
              {scanMode === 'qr' && 'Scan QR Code'}
              {scanMode === 'pin' && 'Enter PIN'}
              {scanMode === 'photo' && 'Face Recognition'}
              {!scanMode && 'Initializing...'}
            </h2>
            {authProgress && (
              <p className="text-sm text-gray-600">
                {authFlow.completedMethods.length > 0 ? 
                  'Additional verification required' : 
                  'Primary authentication'
                }
              </p>
            )}
          </div>

          {/* QR Scanner Mode */}
          {scanMode === 'qr' && (
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <FaQrcode className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-lg font-semibold">Scan QR Code</p>
                <p className="text-sm text-gray-600">Hold your QR code in front of the camera</p>
              </div>
              
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <Scanner
                  onScan={(detectedCodes) => {
                    if (detectedCodes.length > 0 && !processing) {
                      handleQRScan(detectedCodes[0].rawValue);
                    }
                  }}
                  onError={(error) => console.error('QR Scanner Error:', error)}
                  constraints={{ facingMode: 'environment' }}
                  formats={['qr_code']}
                  styles={{ 
                    container: { 
                      height: '300px', 
                      width: '100%' 
                    } 
                  }}
                  components={{
                    finder: true,
                    torch: true,
                    zoom: false,
                    onOff: false
                  }}
                  paused={qrPaused}
                  scanDelay={1000}
                />
                
                {processing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="loading loading-spinner loading-lg mb-2"></div>
                      <p>Processing QR Code...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-600">
                {qrPaused ? 'Scanner paused...' : 'Scanner active'}
              </div>
            </div>
          )}

          {/* PIN Entry Mode */}
          {scanMode === 'pin' && (
            <div className="text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-primary text-primary-content rounded-full w-16">
                  <FaKeyboard className="text-2xl" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">Enter PIN</h2>
              <p className="text-gray-600 mb-6">
                {authFlow.personnel ? 
                  `Enter PIN for ${authFlow.personnel.fname} ${authFlow.personnel.lname}` :
                  'Enter your 6-digit PIN code'
                }
              </p>
              
              <PinEntry 
                length={6} 
                onComplete={handlePinEntry}
                disabled={processing}
              />
            </div>
          )}

          {/* Photo Recognition Mode - UPDATED WITH LIVE CAMERA */}
         {scanMode === 'photo' && (
  <div className="text-center">
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-6 mb-4">
      <FaCamera className="text-6xl text-blue-500 mx-auto mb-4" />
      <p className="text-lg font-semibold">Face Recognition</p>
      <p className="text-sm text-gray-600">
        {authFlow.personnel ? 
          `Verify identity for ${authFlow.personnel.fname} ${authFlow.personnel.lname}` :
          'Position your face in the center of the camera view'
        }
      </p>
      <div className="mt-2 text-xs text-blue-600">
        <p>• Look directly at the camera</p>
        <p>• Ensure good lighting on your face</p>
        <p>• Keep your face centered in the frame</p>
        <p>• Photo will be taken automatically in 3 seconds</p>
      </div>
    </div>
    
    <CameraCapture 
      onCapture={handleCameraCapture}
      disabled={processing}
      processing={processing}
    />
  </div>
)}


          {/* Success Message */}
          {success && (
            <div className="alert alert-success mt-4">
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mt-4">
              <span>{error}</span>
              <button 
                className="btn btn-sm btn-ghost ml-auto"
                onClick={() => setError('')}
              >
                ✕
              </button>
            </div>
          )}

          {/* Processing Indicator */}
          {processing && scanMode !== 'qr' && scanMode !== 'photo' && (
            <div className="text-center mt-4">
              <span className="loading loading-spinner loading-md"></span>
              <p className="text-sm text-gray-600 mt-2">Verifying access...</p>
            </div>
          )}

          {/* Reset Button */}
          <div className="flex justify-center mt-4">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={resetScanner}
              disabled={processing}
            >
              Reset Authentication
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskScanner;
