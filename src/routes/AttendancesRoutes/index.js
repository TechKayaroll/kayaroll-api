const express = require('express');
const attendanceRoutes = require('./attendanceRoutes');

const Routes = express.Router();

Routes.use('/attendance', attendanceRoutes);

module.exports = Routes;
