const express = require('express');
const locationRoutes = require('./locationRoutes');
const adminLocationRoutes = require('./adminLocationRoutes');

const Routes = express.Router();

Routes.use('/location', locationRoutes);
Routes.use('/location/admin', adminLocationRoutes);

module.exports = Routes;
