// src/components/CameraCapture.jsx
import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
 

// Note: 'face-api.js' is expected to be loaded via a <script> tag in your index.html
// and will be available on the window object as 'faceapi'.
// The import statement has been removed to fix the build error.

const CameraCapture = ({ onCapture, disabled, processing }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [autoCapture, setAutoCapture] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  
  const detectionInterval = useRef(null);
  const countdownTimeout = useRef(null);
  const streamRef = useRef(null);
  const isCapturingRef = useRef(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      // Ensure faceapi is available on the window object
      if (!window.faceapi) {
        console.error('face-api.js not loaded. Please include it in your HTML.');
        setCameraError('Face detection library not found.');
        return;
      }

      try {
        const MODEL_URL = '/models';
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        console.log('Face-api.js models loaded successfully');
      } catch (error) {
        console.error('Error loading face-api.js models:', error);
        setCameraError('Failed to load face detection models. Please refresh the page.');
      }
    };

    loadModels();
  }, []);

  // Initialize camera and face detection
  useEffect(() => {
    if (!modelsLoaded || disabled) {
      cleanup();
      return;
    }

    initCamera();
    return cleanup;
  }, [modelsLoaded, disabled]);

  // Start/stop detection based on autoCapture setting and video readiness
  useEffect(() => {
    if (!modelsLoaded || disabled || !videoReady) return;

    if (autoCapture) {
      startFaceDetection();
    } else {
      stopFaceDetection();
    }
  }, [autoCapture, modelsLoaded, disabled, videoReady]);

  const cleanup = () => {
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    stopFaceDetection();
    setFaceDetected(false);
    setCountdown(0);
    setVideoReady(false);
    isCapturingRef.current = false;
  };

  const stopFaceDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    
    if (countdownTimeout.current) {
      clearTimeout(countdownTimeout.current);
      countdownTimeout.current = null;
    }
  };

  const initCamera = async () => {
    try {
      setCameraError('');
      setVideoReady(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        const handleVideoReady = () => {
          console.log('Video loaded and ready');
          setVideoReady(true);
        };

        videoRef.current.onloadedmetadata = handleVideoReady;
        videoRef.current.oncanplay = handleVideoReady;
        
        videoRef.current.onplaying = () => {
          console.log('Video is now playing');
          setVideoReady(true);
        };

        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn('Video play failed:', playError);
        }

        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            setVideoReady(true);
            console.log('Video ready via fallback check');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const startFaceDetection = () => {
    if (detectionInterval.current || !autoCapture || !videoReady) return;

    console.log('Starting face detection...');
    detectionInterval.current = setInterval(async () => {
      await detectFaces();
    }, 500);
  };

  const detectFaces = async () => {
    if (!videoRef.current || 
        !modelsLoaded || 
        processing || 
        isCapturingRef.current || 
        !videoReady ||
        !window.faceapi ||
        videoRef.current.readyState < 2 ||
        videoRef.current.paused ||
        !videoRef.current.videoWidth || 
        !videoRef.current.videoHeight) {
      return;
    }

    try {
      const detections = await window.faceapi
        .detectAllFaces(videoRef.current, new window.faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        }));

      if (detections.length > 0) {
        const detection = detections[0];
        const { width, height } = detection.box;
        const { x, y } = detection.box;
        
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        
        if (!videoWidth || !videoHeight) {
          console.warn('Video dimensions not available yet');
          return;
        }
        
        const faceArea = (width * height) / (videoWidth * videoHeight);
        const isWellSized = faceArea > 0.05 && faceArea < 0.5;
        const isCentered = x > videoWidth * 0.1 && x + width < videoWidth * 0.9 &&
                          y > videoHeight * 0.1 && y + height < videoHeight * 0.9;
        
        if (isWellSized && isCentered) {
          if (!faceDetected && countdown === 0) {
            setFaceDetected(true);
            startCountdown();
          }
        } else {
          resetDetection();
        }
      } else {
        resetDetection();
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
  };

  const resetDetection = () => {
    setFaceDetected(false);
    setCountdown(0);
    if (countdownTimeout.current) {
      clearTimeout(countdownTimeout.current);
      countdownTimeout.current = null;
    }
  };

  const startCountdown = () => {
    if (isCapturingRef.current) return;
    
    let count = 3;
    setCountdown(count);
    
    const decrementCountdown = () => {
      count--;
      if (count > 0) {
        setCountdown(count);
        countdownTimeout.current = setTimeout(decrementCountdown, 1000);
      } else {
        setCountdown(0);
        capturePhoto();
      }
    };
    
    countdownTimeout.current = setTimeout(decrementCountdown, 1000);
  };

  const capturePhoto = async () => {
    console.log('capturePhoto called');
    
    if (!videoRef.current || 
        !canvasRef.current || 
        processing || 
        isCapturingRef.current ||
        !videoReady ||
        !window.faceapi) {
      console.warn('Cannot capture: basic checks failed');
      return;
    }

    const video = videoRef.current;
    
    if (video.readyState < 2 ||
        video.paused ||
        !video.videoWidth || 
        !video.videoHeight ||
        video.videoWidth === 0 ||
        video.videoHeight === 0) {
      console.warn('Cannot capture: video not properly playing', {
        readyState: video.readyState,
        paused: video.paused,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      return;
    }

    isCapturingRef.current = true;
    console.log('Starting capture process...');

    console.log('Performing final face verification before capture...');
    const finalDetections = await window.faceapi.detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.5
    }));

    if (finalDetections.length === 0) {
        console.warn('Capture aborted: Final verification failed. No face detected.');
        isCapturingRef.current = false;
        resetDetection();
        return;
    }
    console.log('Final verification passed. Capturing frame.');

    const canvas = canvasRef.current;
    
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log('Canvas dimensions set:', canvas.width, 'x', canvas.height);
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log('Image drawn to canvas');
      
      canvas.toBlob((blob) => {
        console.log('Blob created:', blob ? `${blob.size} bytes` : 'null');
        
        if (blob && blob.size > 0) {
          const file = new File([blob], 'face-capture.jpg', { type: 'image/jpeg' });
          console.log('File created:', file.size, 'bytes');
          onCapture(file);
        } else {
          console.error('Failed to create blob or blob is empty');
          setCameraError('Failed to capture image. Please try again.');
        }
        
        setTimeout(() => {
          isCapturingRef.current = false;
          resetDetection();
        }, 1000);
      }, 'image/jpeg', 0.95);
      
    } catch (error) {
      console.error('Error during capture:', error);
      isCapturingRef.current = false;
      setCameraError('Capture failed. Please try again.');
    }
  };

  const toggleAutoCapture = () => {
    const newAutoCapture = !autoCapture;
    setAutoCapture(newAutoCapture);
    
    if (!newAutoCapture) {
      stopFaceDetection();
      resetDetection();
    }
  };

  if (!modelsLoaded) {
    return (
      <div className="text-center p-4">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p>Loading face detection models...</p>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className="text-center p-4">
        <div className="alert alert-error mb-4">
          <span>{cameraError}</span>
        </div>
        <div className="flex justify-center space-x-2">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setCameraError('');
              initCamera();
            }}
          >
            Retry Camera
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Face Detection Status */}
      <div className="mb-4">
        <div className={`badge ${faceDetected ? 'badge-success' : 'badge-outline'} mb-2`}>
          {!videoReady 
            ? '⏳ Initializing camera...'
            : autoCapture 
              ? (faceDetected ? '✓ Face Detected - Good Position' : '⚪ Position your face in the center')
              : '🔧 Manual Mode - Ready to capture'
          }
        </div>
        
        {countdown > 0 && (
          <div className="text-center">
            <div className="text-4xl font-bold text-primary animate-pulse">
              {countdown}
            </div>
            <p className="text-sm text-gray-600">Auto-capturing...</p>
          </div>
        )}
      </div>

      {/* Camera Feed */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full"
          style={{ height: '300px', objectFit: 'cover' }}
        />
        
        {!videoReady && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="loading loading-spinner loading-lg mb-2"></div>
              <p>Starting camera...</p>
            </div>
          </div>
        )}
        
        {videoReady && autoCapture && faceDetected && countdown === 0 && (
          <div className="absolute inset-0 border-4 border-green-400 rounded-lg animate-pulse">
            <div className="absolute top-2 left-2 bg-green-400 text-white px-2 py-1 rounded text-sm">
              Face Ready
            </div>
          </div>
        )}
        
        {countdown > 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl font-bold animate-bounce">{countdown}</div>
              <p className="text-lg">Get ready...</p>
            </div>
          </div>
        )}
        
        {processing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="loading loading-spinner loading-lg mb-2"></div>
              <p>Processing image...</p>
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Controls */}
      <div className="space-y-2">
        <div className="flex justify-center space-x-2">
          <button
            className="btn btn-primary"
            onClick={capturePhoto}
            disabled={disabled || processing || !modelsLoaded || !videoReady || isCapturingRef.current}
          >
            {processing ? 'Processing...' : 'Manual Capture'}
          </button>
          
          <button
            className={`btn ${autoCapture ? 'btn-success' : 'btn-outline'}`}
            onClick={toggleAutoCapture}
            disabled={disabled || processing || !modelsLoaded || !videoReady}
          >
            Auto: {autoCapture ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <div className="text-xs text-gray-600">
          {!videoReady 
            ? 'Initializing camera...'
            : autoCapture 
              ? 'Position your face in the center for automatic capture'
              : 'Manual mode: Click capture when ready'
          }
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;

