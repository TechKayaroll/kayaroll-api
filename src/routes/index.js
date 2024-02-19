const express = require('express');
const UsersRoutes = require('./UsersRoutes');
const AttendancesRoutes = require('./AttendancesRoutes');
const OrganizationRoutes = require('./OrganizationRoutes');
const LocationRoutes = require('./LocationRoutes');
const ScheduleRoutes = require('./ScheduleRoutes');

const Routes = express.Router();

Routes.use('/users', UsersRoutes);
Routes.use('/attendances', AttendancesRoutes);
Routes.use('/organizations', OrganizationRoutes);
Routes.use('/locations', LocationRoutes);
Routes.use('/schedules', ScheduleRoutes);

module.exports = Routes;
