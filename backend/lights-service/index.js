require('dotenv').config();
const express = require('express');
const cors = require('cors');
const lightsRoutes = require('./routes/lights');

const app = express();
app.use(cors({ origin: ['http://localhost:5500', 'http://127.0.0.1:5500'] }));
app.use(express.json());
app.use('/lights', lightsRoutes);

const PORT = process.env.PORT || 3002;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Lights service running on port ${PORT}`));
}

module.exports = app;
