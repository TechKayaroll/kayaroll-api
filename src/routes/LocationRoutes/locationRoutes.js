const ChildRouter = require('express').Router();
const CONTROLLER = require('../../controllers/locationController');
const { authentication } = require('../../middlewares/middlewareAuth');
const schema = require('../../joiSchema/locationSchema');
const validate = require('../../middlewares/middlewareValidation');

const LocationRoutes = () => {
  ChildRouter.use(authentication);

  return ChildRouter;
};

module.exports = LocationRoutes();
