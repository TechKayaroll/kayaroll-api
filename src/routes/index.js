const express = require('express');
const UsersRoutes = require('./UsersRoutes');
const AttendancesRoutes = require('./AttendancesRoutes');

const Routes = express.Router();

Routes.use('/users', UsersRoutes);
Routes.use('/attendances', AttendancesRoutes);

module.exports = Routes;
