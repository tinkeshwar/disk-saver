const express = require('express');
const path = require('path');
const { initDb } = require('./src/services/db-operation');
const { SERVER_PORT } = require('./src/configs/constant');
const appRoutes = require('./src/routes/app.routes');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use(appRoutes);

// Start the server and periodic scan
const startServer = async () => {
  await initDb();
  // await scanFiles(); // Start periodic scanning
  const port = SERVER_PORT;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch(err => console.error(`Failed to start server: ${err}`));