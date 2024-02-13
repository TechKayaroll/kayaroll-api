const ChildRouter = require('express').Router();
const CONTROLLER = require('../../controllers/locationController');
const { authentication } = require('../../middlewares/middlewareAuth');
const schema = require('../../joiSchema/locationSchema');
const validate = require('../../middlewares/middlewareValidation');

const AdminLocationRoutes = () => {
  ChildRouter.use(authentication);

  ChildRouter.post(
    '/admin/profiles/create',
    validate.validate(schema.schemaCreateLocationProfile),
    CONTROLLER.createLocationProfile,
  );
  ChildRouter.post(
    '/admin/profiles/delete',
    validate.validate(schema.schemaDeleteLocationProfile),
    CONTROLLER.removeLocationProfiles,
  );
  ChildRouter.post(
    '/admin/profiles/update',
    validate.validate(schema.schemaUpdateLocationProfile),
    CONTROLLER.updateLocationProfile,
  );

  ChildRouter.get('/admin/profiles', CONTROLLER.getLocationProfile);

  return ChildRouter;
};

module.exports = AdminLocationRoutes();
