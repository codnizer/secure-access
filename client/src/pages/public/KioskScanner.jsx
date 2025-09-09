// src/pages/public/KioskScanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCamera, FaArrowLeft, FaUser, FaLock } from 'react-icons/fa';
import PinEntry from './PinEntry';

// Static data for users - replace with API later
const staticUsers = [
  {
    id: 'USER-001',
    qrCode: 'QR123456789',
    name: 'John Doe',
    pin: '1234',
    isAuthorized: true,
    faceEmbedding: 'face_data_123' // Placeholder
  },
  {
    id: 'USER-002', 
    qrCode: 'QR987654321',
    name: 'Jane Smith',
    pin: '5678',
    isAuthorized: true,
    faceEmbedding: 'face_data_456'
  },
  {
    id: 'USER-003',
    qrCode: 'QR555444333',
    name: 'Bob Wilson',
    pin: '9999',
    isAuthorized: false,
    faceEmbedding: 'face_data_789'
  }
];

const KioskScanner = () => {
  const { kioskId } = useParams();
  const navigate = useNavigate();
  
  const [scanMode, setScanMode] = useState('qr'); // 'qr', 'pin', 'face'
  const [scannedUser, setScannedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Mock QR Scanner (replace with actual library later)
  const mockQRScan = () => {
    // Simulate scanning after 3 seconds
    setTimeout(() => {
      const mockQRData = 'QR123456789'; // This would come from actual scanner
      handleQRResult(mockQRData);
    }, 3000);
  };

  const handleQRResult = (qrData) => {
    setError('');
    
    // Find user by QR code
    const user = staticUsers.find(u => u.qrCode === qrData);
    
    if (!user) {
      setError('QR code not recognized. Please try again.');
      return;
    }
    
    if (!user.isAuthorized) {
      setError('Access denied. You are not authorized to use this system.');
      return;
    }
    
    setScannedUser(user);
    setScanMode('pin');
    setIsScanning(false);
  };

  const handlePinComplete = (enteredPin) => {
    if (!scannedUser) return;
    
    if (enteredPin === scannedUser.pin) {
      setSuccess(`Welcome, ${scannedUser.name}!`);
      setScanMode('face');
      
      // Simulate face recognition after PIN success
      setTimeout(() => {
        handleFaceRecognition();
      }, 2000);
    } else {
      setError('Incorrect PIN. Please try again.');
      // Reset to QR scanning after wrong PIN
      setTimeout(() => {
        resetToQRScan();
      }, 2000);
    }
  };

  const handleFaceRecognition = () => {
    // Mock face recognition - replace with actual implementation
    const faceRecognitionSuccess = Math.random() > 0.3; // 70% success rate for demo
    
    if (faceRecognitionSuccess) {
      setSuccess('Face recognition successful! Access granted.');
      // Navigate to success page or perform access action
      setTimeout(() => {
        alert('Access Granted! Door unlocked.');
        navigate('/kiosk');
      }, 2000);
    } else {
      setError('Face recognition failed. Please try again.');
      setTimeout(() => {
        resetToQRScan();
      }, 2000);
    }
  };

  const resetToQRScan = () => {
    setScanMode('qr');
    setScannedUser(null);
    setError('');
    setSuccess('');
    setIsScanning(true);
  };

  useEffect(() => {
    if (scanMode === 'qr' && isScanning) {
      // Start camera and mock QR scanning
      mockQRScan();
    }
  }, [scanMode, isScanning]);

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
              <h1 className="text-xl font-bold">Access Control</h1>
              <p className="text-sm text-gray-600">Kiosk: {kioskId?.substring(0, 8)}</p>
            </div>
            <div></div>
          </div>

          {/* QR Scanner Mode */}
          {scanMode === 'qr' && (
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <FaCamera className="text-6xl text-gray-400 mx-auto mb-4" />
                {isScanning ? (
                  <div>
                    <div className="loading loading-spinner loading-lg mb-4"></div>
                    <p className="text-lg font-semibold">Scanning QR Code...</p>
                    <p className="text-sm text-gray-600">Please hold your QR code in front of the camera</p>
                  </div>
                ) : (
                  <p className="text-lg">Camera Ready</p>
                )}
              </div>
              
              {/* Mock camera view */}
              <div className="bg-black rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="border-2 border-white border-dashed w-48 h-48 flex items-center justify-center">
                  <span className="text-white text-sm">QR Scanner View</span>
                </div>
              </div>
              
              <button 
                className="btn btn-secondary btn-sm"
                onClick={mockQRScan}
                disabled={isScanning}
              >
                Simulate QR Scan
              </button>
            </div>
          )}

          {/* PIN Entry Mode */}
          {scanMode === 'pin' && scannedUser && (
            <div className="text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-primary text-primary-content rounded-full w-16">
                  <FaUser className="text-2xl" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">Welcome, {scannedUser.name}</h2>
              <p className="text-gray-600 mb-6">Please enter your PIN to continue</p>
              
              <PinEntry onComplete={handlePinComplete} />
              
              <button 
                className="btn btn-ghost btn-sm mt-4"
                onClick={resetToQRScan}
              >
                Use Different QR Code
              </button>
            </div>
          )}

          {/* Face Recognition Mode */}
          {scanMode === 'face' && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-8 mb-4">
                <FaLock className="text-6xl text-blue-500 mx-auto mb-4" />
                <div className="loading loading-spinner loading-lg mb-4"></div>
                <p className="text-lg font-semibold">Face Recognition in Progress...</p>
                <p className="text-sm text-gray-600">Please look at the camera</p>
              </div>
              
              {/* Mock camera view for face recognition */}
              <div className="bg-black rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="border-2 border-green-400 rounded-full w-32 h-32 flex items-center justify-center">
                  <span className="text-green-400 text-sm">Face Detection</span>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="alert alert-error mt-4">
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success mt-4">
              <span>{success}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KioskScanner;
