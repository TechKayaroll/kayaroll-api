const express = require('express');
const organizationRoutes = require('./organizationRoutes');

const Routes = express.Router();

Routes.use('/organization', organizationRoutes);

module.exports = Routes;
