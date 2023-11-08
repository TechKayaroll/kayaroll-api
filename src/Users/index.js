const Router = require('express').Router();
const UsersRoutes = require('./modules');

const UserRoute = () => {
  Router.use('/user', UsersRoutes);
  return Router;
};

module.exports = UserRoute();
