const express = require('express');
const path = require('path');
const { initDb } = require('./src/services/db-operation');
const appRoutes = require('./src/routes/app.routes');
const scanFiles = require('./src/services/file-scan');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../frontend/build')));
app.use(appRoutes);

const startServer = async () => {
  await initDb();
  await scanFiles();
  const port = 5001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch(err => console.error(`Failed to start server: ${err}`));