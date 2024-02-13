const express = require('express');
const locationRoutes = require('./locationRoutes');

const Routes = express.Router();
Routes.use('/location', locationRoutes);

module.exports = Routes;
