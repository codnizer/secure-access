const Personnel = require('../models/personnelModel');
const Emplacement = require('../models/emplacementModel'); // To validate Emplacement ID
 const PersonnelEmplacements = require('../models/PersonnelEmplacements');

// const fingerprintEmbeddingsTest=[0.208106,0.233367,0.123394,0.257414,0.410535,0.454487,0.410464,0.180361,0.954105,0.606241,0.385485,0.397344,0.351621,0.837193,0.157483,0.896455,0.500804,0.991825,0.687566,0.253827,0.736993,0.20859,0.049978,0.682004,0.914645,0.502396,0.179336,0.448639,0.781242,0.18776,0.474154,0.313853,0.948205,0.173584,0.554549,0.378055,0.656161,0.501057,0.974204,0.274199,0.177735,0.686502,0.758642,0.303825,0.976943,0.379907,0.316056,0.622893,0.69378,0.881032,0.392852,0.165794,0.571582,0.325344,0.216726,0.97997,0.810025,0.507621,0.426645,0.23294,0.628961,0.81695,0.325666,0.454686,0.931669,0.238909,0.073297,0.377243,0.750717,0.083399,0.774378,0.451443,0.74428,0.66969,0.595374,0.466847,0.279869,0.696124,0.192314,0.556283,0.3699,0.45071,0.225368,0.902405,0.577647,0.179735,0.270374,0.754382,0.590851,0.994788,0.630536,0.940406,0.338916,0.704518,0.324236,0.235058,0.497424,0.531186,0.73987,0.537559,0.476322,0.840508,0.042588,0.378445,0.909919,0.493051,0.638613,0.549228,0.637798,0.786833,0.290535,0.15634,0.122672,0.061806,0.339876,0.114701,0.990941,0.897985,0.40719,0.7122,0.970705,0.581792,0.632573,0.231484,0.687403,0.1194,0.11434,0.308102,0.469096,0.512245,0.120079,0.08149,0.681996,0.227679,0.478652,0.672694,0.897659,0.412541,0.982231,0.608408,0.628555,0.82217,0.722403,0.345416,0.684857,0.667012,0.025296,0.31247,0.07721,0.775935,0.827051,0.481655,0.694919,0.90692,0.134577,0.597423,0.591172,0.044492,0.223031,0.624358,0.051752,0.260352,0.890788,0.124741,0.878678,0.00263,0.605339,0.095189,0.080374,0.479319,0.873526,0.808992,0.761609,0.51032,0.23633,0.746477,0.424839,0.144873,0.96558,0.259253,0.813374,0.471708,0.23176,0.486814,0.40029,0.240143,0.475574,0.441683,0.487506,0.058655,0.601041,0.954336,0.238088,0.985078,0.945867,0.117424,0.222753,0.439645,0.809054,0.042201,0.087129,0.980513,0.841114,0.996503,0.613774,0.668457,0.934805,0.711863,0.006952,0.352779,0.206654,0.926914,0.75716,0.718167,0.041637,0.867088,0.150633,0.744926,0.422185,0.038578,0.536346,0.793782,0.840466,0.833081,0.695775,0.5743,0.065528,0.484739,0.492149,0.780424,0.086555,0.828882,0.953156,0.532478,0.276239,0.349672,0.158531,0.62327,0.908389,0.001754,0.209558,0.55166,0.079628,0.677406,0.813346,0.494302,0.419563,0.05818,0.995035,0.527162,0.020715,0.405851,0.746142,0.366966,0.977818,0.640868]

exports.createPersonnel = async (req, res) => {
  try {
    const {
      national_id,
      fname,
      lname,
      photoUrl,
      pin,
     
      phone,
      service,
     photoEmbeddings,
     // fingerprintEmbeddings,
      isActive,
    } = req.body;

    // Basic validation for required fields
    if (!national_id || !fname || !lname ) {
      return res.status(400).json({ message: 'Missing required fields: national_id, fname, lname, expirationDate' });
    }

 

     
    
    // Format embeddings as strings suitable for database storage

  /*      const formattedPhotoEmbeddings = Array.isArray(photoEmbeddings) 
      ? `[${photoEmbeddings.join(',')}]` 
      : photoEmbeddings;

    const formattedFingerprintEmbeddings = Array.isArray(fingerprintEmbeddings) 
      ? `[${fingerprintEmbeddings.join(',')}]` 
      : fingerprintEmbeddings;
 */

    const newPersonnel = await Personnel.create({
      national_id,
      fname,
      lname,
      photoUrl,
       
      
    
      phone,
      service,
      photoEmbeddings,
     /*  photoEmbeddings: formattedPhotoEmbeddings, // <--- Use formatted string
      fingerprintEmbeddings: formattedFingerprintEmbeddings, // <--- Use formatted string */
      isActive,
    });

    res.status(201).json(newPersonnel);
  } catch (error) {
    console.error('Error creating personnel:', error);
    if (error.message.includes('National ID already exists')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating personnel', error: error.message });
  }
};

exports.getAllPersonnel = async (req, res) => {
  try {
    const personnel = await Personnel.findAll();
    res.status(200).json(personnel);
  } catch (error) {
    console.error('Error fetching personnel:', error);
    res.status(500).json({ message: 'Error fetching personnel', error: error.message });
  }
};

exports.getPersonnelById = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    if (!personnel) {
      return res.status(404).json({ message: 'Personnel not found' });
    }
    res.status(200).json(personnel);
  } catch (error) {
    console.error('Error fetching personnel by ID:', error);
    res.status(500).json({ message: 'Error fetching personnel', error: error.message });
  }
};

exports.getPersonnelByQrCode = async (req, res) => {
  try {
    const personnel = await Personnel.findByQrCode(req.params.qrCode);
    if (!personnel) {
      return res.status(404).json({ message: 'Personnel not found with this QR Code' });
    }
    res.status(200).json(personnel);
  } catch (error) {
    console.error('Error fetching personnel by QR Code:', error);
    res.status(500).json({ message: 'Error fetching personnel', error: error.message });
  }
};


exports.updatePersonnel = async (req, res) => {
  try {
    const {  photoEmbeddings, fingerprintEmbeddings, ...updates } = req.body;

   

   
    if (photoEmbeddings) {
      updates.photoEmbeddings = photoEmbeddings;
    }

    // Ensure embeddings are numeric arrays for PostgreSQL vector type
/*     if (Array.isArray(photoEmbeddings)) {
      updates.photoEmbeddings = photoEmbeddings.map(Number); // keep as array
    }

    if (Array.isArray(fingerprintEmbeddings)) {
      updates.fingerprintEmbeddings = fingerprintEmbeddings.map(Number); // keep as array
    } */

    

    // Update personnel
    const updatedPersonnel = await Personnel.update(req.params.id, updates);

    if (!updatedPersonnel) {
      return res.status(404).json({ message: 'Personnel not found or no fields to update' });
    }

    res.status(200).json(updatedPersonnel);
  } catch (error) {
    console.error('Error updating personnel:', error);

    if (error.message.includes('National ID already exists')) {
      return res.status(409).json({ message: error.message });
    }

    res.status(500).json({ message: 'Error updating personnel', error: error.message });
  }
};


exports.deletePersonnel = async (req, res) => {
  try {
    const deletedPersonnel = await Personnel.delete(req.params.id);
    if (!deletedPersonnel) {
      return res.status(404).json({ message: 'Personnel not found' });
    }
    res.status(200).json({ message: 'Personnel deleted successfully', deletedPersonnel });
  } catch (error) {
    console.error('Error deleting personnel:', error);
    res.status(500).json({ message: 'Error deleting personnel', error: error.message });
  }
};



//uploade image
const tf = require('@tensorflow/tfjs-node');
const faceapi = require('@vladmandic/face-api');
const { Canvas, Image, ImageData, loadImage } = require('canvas');

const fs = require('fs');

const multer = require('multer');
const path = require('path');

 
 

const uploadsDir = path.join(__dirname, '../uploads');

// Make sure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}




// Configure canvas for face-api.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Initialize models (call this once when server starts)
let modelsLoaded = false;

async function loadFaceAPIModels() {
  try {
    const modelPath = path.join(__dirname, '../ai-models');
    
    // Create models directory if it doesn't exist
    if (!fs.existsSync(modelPath)) {
      fs.mkdirSync(modelPath, { recursive: true });
      console.log('Models directory created. Please download the face-api.js models');
      console.log('Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights');
      return false;
    }
    
    // Load face-api.js models
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    
    modelsLoaded = true;
    console.log('FaceAPI models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading FaceAPI models:', error);
    return false;
  }
}

// Initialize models when server starts
loadFaceAPIModels();

// Function to generate face embeddings
async function generateFaceEmbeddings(imagePath) {
  if (!modelsLoaded) {
    throw new Error('FaceAPI models not loaded. Please check if models are downloaded.');
  }

  try {
    // Read image
     
     const image = await loadImage(imagePath);
    // Detect faces
    const detections = await faceapi
      .detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detections) {
      throw new Error('No faces detected in the image');
    }
    
    // Return the 128-dimensional face descriptor (we'll pad it to 512 for your requirement)
    const descriptor = Array.from(detections.descriptor);
    
    // Pad to 512 dimensions if needed (your requirement)
    // In practice, face-api.js provides 128-dim embeddings which are standard for face recognition
    // You might want to reconsider if you really need 512 dimensions
/*     const paddedDescriptor = descriptor.concat(Array(512 - descriptor.length).fill(0));
     */
    return descriptor;
  } catch (error) {
    console.error('Error generating face embeddings:', error);
    throw error;
  }
}

// Enhanced upload controller with embedding generation
exports.uploadImageWithEmbeddings = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = path.join(uploadsDir, req.file.filename);
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    let embeddings;
    try {
      embeddings = await generateFaceEmbeddings(imagePath);
    } catch (embeddingError) {
      console.error('Embedding generation failed:', embeddingError);
      return res.status(200).json({
        message: 'Image uploaded but embedding generation failed',
        imageUrl,
        error: embeddingError.message,
      });
    }

    res.status(200).json({
      message: 'Image uploaded and processed successfully',
      imageUrl,
      embeddings,
    });
  } catch (error) {
    console.error('Error in uploadImageWithEmbeddings:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
};

exports.verifyImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imagePath = path.join(uploadsDir, req.file.filename);
    console.log('Uploaded image path:', imagePath);
    // Generate embeddings for the uploaded image
    const uploadedEmbeddings = await generateFaceEmbeddings(imagePath);

    // Fetch all personnel
    const personnelList = await Personnel.findAll();

    let matchedPersonnel = null;
    let highestSimilarity = 0;
    const threshold = 0.9; // adjust threshold according to your accuracy needs

    for (const p of personnelList) {
      if (!p.photoembeddings) continue;

      // Convert stored string to array
      const storedEmbeddings = p.photoembeddings
        .replace(/^\[|\]$/g, '') // remove brackets
        .split(',')
        .map(Number);

      const similarity = cosineSimilarity(uploadedEmbeddings, storedEmbeddings);

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        matchedPersonnel = p;
      }
    }

    if (matchedPersonnel && highestSimilarity >= threshold) {
      return res.status(200).json({
        message: 'Personnel verified',
        personnel: matchedPersonnel,
        similarity: highestSimilarity,
      });
    } else {
      return res.status(404).json({ message: 'No matching personnel found', similarity: highestSimilarity });
    }
  } catch (error) {
    console.error('Error verifying image:', error);
    res.status(500).json({ message: 'Error verifying image', error: error.message });
  }
};
// Get personnel by PIN
exports.getPersonnelByPin = async (req, res) => {
  try {
    const personnel = await Personnel.findByPin(req.params.pin);
    if (!personnel) {
      return res.status(404).json({ message: 'Personnel not found with this PIN' });
    }
    res.status(200).json(personnel);
  } catch (error) {
    console.error('Error fetching personnel by PIN:', error);
    res.status(500).json({ message: 'Error fetching personnel', error: error.message });
  }
};

// Check access permissions
exports.checkAccess = async (req, res) => {
  try {
    const { personnelId, emplacementId } = req.query;
    const hasAccess = await PersonnelEmplacements.hasAccess(personnelId, emplacementId);
    
    if (!hasAccess) {
      return res.json({ hasAccess: false });
    }

    // Check expiration
    const accessData = await PersonnelEmplacements.getByPersonnelId(personnelId);
    const emplacementAccess = accessData.find(access => access.emplacementid === emplacementId);
    
    const isExpired = emplacementAccess?.expirationdate && 
      new Date(emplacementAccess.expirationdate) < new Date();

    res.json({ 
      hasAccess: true, 
      isExpired: !!isExpired,
      expirationDate: emplacementAccess?.expirationdate 
    });
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({ message: 'Error checking access', error: error.message });
  }
};
