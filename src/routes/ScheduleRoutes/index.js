const express = require('express');
const scheduleRoutes = require('./scheduleRoutes');

const Routes = express.Router();
Routes.use('/schedule', scheduleRoutes);

module.exports = Routes;
