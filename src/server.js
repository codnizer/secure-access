const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
 
const HOST = process.env.HOST || 'localhost'; // This should come from environment

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
 