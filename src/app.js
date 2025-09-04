const express = require('express');
const app = express();
const emplacementRoutes = require('./routes/emplacementRoutes'); // Import the new routes
const adminRoutes = require('./routes/adminRoutes');
const personnelRoutes = require('./routes/personnelRoutes');
const guardRoutes = require('./routes/guardRoutes');
const kioskDeviceRoutes = require('./routes/kioskDeviceRoutes');
const path = require('path');
const guardKioskAssignmentRoutes = require('./routes/guardKioskAssignmentRoutes');
const requestRoutes = require('./routes/requestRoutes'); // Import new routes
const logRoutes = require('./routes/logRoutes'); 
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Secure Access System Backend (containerized)!');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Use the new emplacement routes
app.use('/api/emplacements', emplacementRoutes); // All /api/emplacements requests go to emplacementRoutes
app.use('/api/admins', adminRoutes);
app.use('/api/personnel', personnelRoutes); 
app.use('/api/guards', guardRoutes);

app.use('/api/kiosk-devices', kioskDeviceRoutes);
app.use('/api/guard-kiosk-assignments', guardKioskAssignmentRoutes);
app.use('/api/requests', requestRoutes); // New route
app.use('/api/logs', logRoutes);  
module.exports = app;