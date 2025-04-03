require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const morgan = require('morgan');
const logger = require('./config/logger');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger'); 
const userRoutes = require("./Routes/userRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message) } }));

// Database connection
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// app.use("/api/users", require("./Routes/userRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });

  module.exports = app;