const express = require('express');
const UserRoutes = require('./userRoutes');

const Routes = express.Router();

Routes.use('/user', UserRoutes);

module.exports = Routes;
