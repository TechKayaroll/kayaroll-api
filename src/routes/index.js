const express = require('express');
const UsersRoutes = require('./UsersRoutes');
const AttendancesRoutes = require('./AttendancesRoutes');
const OrganizationRoutes = require('./OrganizationRoutes');

const Routes = express.Router();

Routes.use('/users', UsersRoutes);
Routes.use('/attendances', AttendancesRoutes);
Routes.use('/organizations', OrganizationRoutes);

module.exports = Routes;
