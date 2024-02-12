const ChildRouter = require('express').Router();
const CONTROLLER = require('../../controllers/locationController');
const { authentication } = require('../../middlewares/middlewareAuth');
const schema = require('../../joiSchema/locationSchema');
const validate = require('../../middlewares/middlewareValidation');

const LocationRoutes = () => {
  ChildRouter.use(authentication);

  ChildRouter.post('/', validate.validate(schema.schemaCreateLocationProfile), CONTROLLER.createLocationProfile);
  ChildRouter.get('/profiles', CONTROLLER.getLocationProfile);

  return ChildRouter;
};

module.exports = LocationRoutes();
