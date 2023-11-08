const Router = require('express').Router();
const AttendancesRoutes = require('./modules');

const AttendanceRoute = () => {
  Router.use('/attendance', AttendancesRoutes);

  return Router;
};

module.exports = AttendanceRoute();
