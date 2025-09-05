const Personnel = require('../models/personnelModel');
const Emplacement = require('../models/emplacementModel'); // To validate Emplacement ID
 

const photoEmbeddingsTest=[0.606976,0.075212,0.577392,0.36765,0.755744,0.264252,0.209376,0.415068,0.257065,0.504892,0.952431,0.600178,0.073452,0.546464,0.174134,0.991713,0.712682,0.268113,0.591462,0.344609,0.750547,0.883455,0.982044,0.385132,0.797775,0.586744,0.497815,0.533563,0.309232,0.511704,0.138379,0.332616,0.999724,0.248038,0.611982,0.310055,0.129475,0.10731,0.073906,0.828683,0.183464,0.047389,0.885396,0.376569,0.946812,0.748996,0.443419,0.855044,0.38062,0.515287,0.071186,0.468558,0.105569,0.338488,0.35339,0.57637,0.182291,0.839922,0.275362,0.270842,0.965164,0.938735,0.174897,0.508227,0.196398,0.992023,0.652596,0.675784,0.41366,0.653779,0.949211,0.99874,0.97883,0.208285,0.47449,0.888161,0.985532,0.972415,0.081473,0.889933,0.317701,0.799125,0.894567,0.545058,0.394698,0.425466,0.401959,0.428932,0.164028,0.317171,0.60199,0.237287,0.011901,0.662083,0.514692,0.988368,0.55937,0.367328,0.887213,0.368304,0.490753,0.225649,0.608752,0.252002,0.344806,0.418766,0.431451,0.724807,0.608175,0.972104,0.016863,0.628032,0.906671,0.16967,0.343281,0.383461,0.539607,0.954783,0.50197,0.505933,0.865442,0.349315,0.085381,0.475474,0.707986,0.728225,0.07889,0.545686,0.873343,0.030575,0.20439,0.326691,0.696224,0.871116,0.693465,0.650736,0.055022,0.732122,0.811449,0.958693,0.202886,0.619844,0.266892,0.193935,0.827339,0.741202,0.336688,0.64654,0.160246,0.135854,0.836368,0.470614,0.652875,0.153537,0.460539,0.557954,0.874171,0.084994,0.602056,0.006046,0.694449,0.946425,0.261736,0.681161,0.629343,0.413023,0.591535,0.583289,0.308799,0.745497,0.791694,0.059939,0.200218,0.077957,0.068933,0.51315,0.222664,0.89144,0.950345,0.666684,0.032802,0.653543,0.211897,0.593696,0.515549,0.173673,0.443889,0.565508,0.132035,0.69811,0.249975,0.058036,0.828488,0.229017,0.576613,0.772275,0.181181,0.076952,0.121749,0.932951,0.22783,0.745745,0.363244,0.822027,0.679611,0.115054,0.187098,0.484404,0.215544,0.985122,0.221046,0.661888,0.440589,0.114596,0.423493,0.778738,0.996454,0.671803,0.850552,0.308371,0.157029,0.131988,0.873389,0.326069,0.993782,0.556844,0.464122,0.698797,0.099754,0.783682,0.097693,0.213225,0.468491,0.964449,0.221265,0.139002,0.989617,0.329198,0.840267,0.798096,0.764221,0.029051,0.704859,0.602688,0.625849,0.490956,0.601092,0.589942,0.929329,0.106276,0.718272,0.442485,0.53288,0.416731,0.682626,0.675292,0.500245,0.436232,0.025762,0.145329,0.520036,0.258234,0.824979,0.032976,0.511204,0.414455,0.480555,0.723076,0.820946,0.973894,0.584001,0.318611,0.259197,0.358631,0.387615,0.049219,0.563586,0.2825,0.925713,0.306886,0.074595,0.006968,0.865675,0.34681,0.110736,0.259263,0.675978,0.043564,0.350308,0.394091,0.58141,0.976982,0.003214,0.130802,0.775197,0.947711,0.584958,0.453239,0.182338,0.083018,0.236296,0.275109,0.367924,0.738551,0.016411,0.52972,0.601485,0.847932,0.467408,0.476401,0.343679,0.528628,0.86228,0.437226,0.474011,0.069159,0.428738,0.672696,0.041537,0.627309,0.18873,0.071505,0.504979,0.972313,0.240968,0.086578,0.780995,0.407047,0.42264,0.043699,0.633559,0.791209,0.73601,0.72482,0.456381,0.507556,0.974776,0.456699,0.904825,0.084213,0.970465,0.523661,0.925488,0.284249,0.146641,0.498097,0.657557,0.822178,0.638825,0.719874,0.432212,0.283306,0.313544,0.572582,0.290115,0.315811,0.094894,0.863401,0.101942,0.91189,0.799305,0.331499,0.695429,0.53892,0.569313,0.327864,0.219176,0.13926,0.789052,0.130782,0.075846,0.640418,0.084298,0.388277,0.007563,0.699367,0.905657,0.842405,0.507985,0.132338,0.351737,0.764597,0.812511,0.155549,0.122144,0.94277,0.568601,0.20356,0.819514,0.63068,0.989709,0.309547,0.893517,0.687646,0.413225,0.662463,0.835019,0.017386,0.122278,0.751627,0.733208,0.925817,0.359636,0.695142,0.652467,0.749524,0.653466,0.318711,0.934335,0.725007,0.926798,0.75846,0.830676,0.414482,0.822462,0.048687,0.544755,0.649465,0.166035,0.909605,0.256831,0.120981,0.32812,0.937044,0.341625,0.56322,0.763884,0.034309,0.243357,0.45596,0.944487,0.612596,0.291046,0.473333,0.078067,0.16157,0.87204,0.578502,0.000961,0.91211,0.812852,0.636156,0.965682,0.827049,0.141044,0.220777,0.449703,0.16741,0.300966,0.633416,0.435662,0.181411,0.888564,0.55469,0.570593,0.386598,0.690326,0.473441,0.809542,0.9097,0.590354,0.410024,0.901142,0.253188,0.646201,0.476088,0.405894,0.964881,0.300221,0.239411,0.963336,0.663359,0.088165,0.611284,0.637732,0.305659,0.080722,0.836918,0.933056,0.358064,0.312962,0.082877,0.358064,0.123364,0.009216,0.11453,0.687733,0.224316,0.566492,0.257994,0.673978,0.039234,0.90775,0.470068,0.629589,0.381003,0.413947,0.111137,0.592619,0.108837,0.521005,0.721714,0.345802,0.21178,0.861475,0.595686,0.330424,0.014893,0.687798,0.577227,0.612118,0.272487]
const fingerprintEmbeddingsTest=[0.208106,0.233367,0.123394,0.257414,0.410535,0.454487,0.410464,0.180361,0.954105,0.606241,0.385485,0.397344,0.351621,0.837193,0.157483,0.896455,0.500804,0.991825,0.687566,0.253827,0.736993,0.20859,0.049978,0.682004,0.914645,0.502396,0.179336,0.448639,0.781242,0.18776,0.474154,0.313853,0.948205,0.173584,0.554549,0.378055,0.656161,0.501057,0.974204,0.274199,0.177735,0.686502,0.758642,0.303825,0.976943,0.379907,0.316056,0.622893,0.69378,0.881032,0.392852,0.165794,0.571582,0.325344,0.216726,0.97997,0.810025,0.507621,0.426645,0.23294,0.628961,0.81695,0.325666,0.454686,0.931669,0.238909,0.073297,0.377243,0.750717,0.083399,0.774378,0.451443,0.74428,0.66969,0.595374,0.466847,0.279869,0.696124,0.192314,0.556283,0.3699,0.45071,0.225368,0.902405,0.577647,0.179735,0.270374,0.754382,0.590851,0.994788,0.630536,0.940406,0.338916,0.704518,0.324236,0.235058,0.497424,0.531186,0.73987,0.537559,0.476322,0.840508,0.042588,0.378445,0.909919,0.493051,0.638613,0.549228,0.637798,0.786833,0.290535,0.15634,0.122672,0.061806,0.339876,0.114701,0.990941,0.897985,0.40719,0.7122,0.970705,0.581792,0.632573,0.231484,0.687403,0.1194,0.11434,0.308102,0.469096,0.512245,0.120079,0.08149,0.681996,0.227679,0.478652,0.672694,0.897659,0.412541,0.982231,0.608408,0.628555,0.82217,0.722403,0.345416,0.684857,0.667012,0.025296,0.31247,0.07721,0.775935,0.827051,0.481655,0.694919,0.90692,0.134577,0.597423,0.591172,0.044492,0.223031,0.624358,0.051752,0.260352,0.890788,0.124741,0.878678,0.00263,0.605339,0.095189,0.080374,0.479319,0.873526,0.808992,0.761609,0.51032,0.23633,0.746477,0.424839,0.144873,0.96558,0.259253,0.813374,0.471708,0.23176,0.486814,0.40029,0.240143,0.475574,0.441683,0.487506,0.058655,0.601041,0.954336,0.238088,0.985078,0.945867,0.117424,0.222753,0.439645,0.809054,0.042201,0.087129,0.980513,0.841114,0.996503,0.613774,0.668457,0.934805,0.711863,0.006952,0.352779,0.206654,0.926914,0.75716,0.718167,0.041637,0.867088,0.150633,0.744926,0.422185,0.038578,0.536346,0.793782,0.840466,0.833081,0.695775,0.5743,0.065528,0.484739,0.492149,0.780424,0.086555,0.828882,0.953156,0.532478,0.276239,0.349672,0.158531,0.62327,0.908389,0.001754,0.209558,0.55166,0.079628,0.677406,0.813346,0.494302,0.419563,0.05818,0.995035,0.527162,0.020715,0.405851,0.746142,0.366966,0.977818,0.640868]

exports.createPersonnel = async (req, res) => {
  try {
    const {
      national_id,
      fname,
      lname,
      photoUrl,
      pin,
      expirationDate,
      assignedEmplacementId,
      phone,
      service,
      /* photoEmbeddings,
      fingerprintEmbeddings, */
      isActive,
    } = req.body;

    // Basic validation for required fields
    if (!national_id || !fname || !lname || !expirationDate) {
      return res.status(400).json({ message: 'Missing required fields: national_id, fname, lname, expirationDate' });
    }

    // Validate assignedEmplacementId if provided
    if (assignedEmplacementId) {
      const emplacementExists = await Emplacement.findById(assignedEmplacementId);
      if (!emplacementExists) {
        return res.status(400).json({ message: 'Invalid assignedEmplacementId: Emplacement does not exist' });
      }
    }

    const photoEmbeddings = photoEmbeddingsTest;
    const fingerprintEmbeddings = fingerprintEmbeddingsTest;
    
    // Format embeddings as strings suitable for database storage

       const formattedPhotoEmbeddings = Array.isArray(photoEmbeddings) 
      ? `[${photoEmbeddings.join(',')}]` 
      : photoEmbeddings;

    const formattedFingerprintEmbeddings = Array.isArray(fingerprintEmbeddings) 
      ? `[${fingerprintEmbeddings.join(',')}]` 
      : fingerprintEmbeddings;


    const newPersonnel = await Personnel.create({
      national_id,
      fname,
      lname,
      photoUrl,
       
      expirationDate,
      assignedEmplacementId,
      phone,
      service,
      photoEmbeddings: formattedPhotoEmbeddings, // <--- Use formatted string
      fingerprintEmbeddings: formattedFingerprintEmbeddings, // <--- Use formatted string
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
    const { assignedEmplacementId, photoembeddings, fingerprintEmbeddings, ...updates } = req.body;

    // Validate assignedEmplacementId if provided
    if (assignedEmplacementId !== undefined) {
      if (assignedEmplacementId !== null) {
        const emplacementExists = await Emplacement.findById(assignedEmplacementId);
        if (!emplacementExists) {
          return res.status(400).json({ message: 'Invalid assignedEmplacementId: Emplacement does not exist' });
        }
      }
      updates.assignedEmplacementId = assignedEmplacementId; // can be null
    }

    console.log('Received photoEmbeddings:', photoembeddings);
    if (photoembeddings) {
      updates.photoEmbeddings = photoembeddings;
    }

    // Ensure embeddings are numeric arrays for PostgreSQL vector type
/*     if (Array.isArray(photoEmbeddings)) {
      updates.photoEmbeddings = photoEmbeddings.map(Number); // keep as array
    }

    if (Array.isArray(fingerprintEmbeddings)) {
      updates.fingerprintEmbeddings = fingerprintEmbeddings.map(Number); // keep as array
    } */

     console.log('Updates to be applied:', updates);

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
