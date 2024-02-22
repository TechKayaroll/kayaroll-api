const ChildRouter = require('express').Router();
const CONTROLLER = require('../../controllers/locationController');
const { authentication, authorizationByRole } = require('../../middlewares/middlewareAuth');
const schema = require('../../joiSchema/locationSchema');
const validate = require('../../middlewares/middlewareValidation');
const { USER_ROLE } = require('../../utils/constants');

const AdminLocationRoutes = () => {
  ChildRouter.use(authentication);
  ChildRouter.get(
    '/search-address',
    validate.validate(null, schema.schemaSearchLocation),
    CONTROLLER.queryLocationByName,
  );

  ChildRouter.get(
    '/search',
    validate.validate(null, schema.schemaSearchLocationByCoordinateOrPlaceId),
    CONTROLLER.searchLocationByCoordinateOrPlaceId,
  );

  ChildRouter.post(
    '/admin/profiles/create',
    authorizationByRole([USER_ROLE.ADMIN]),
    validate.validate(schema.schemaCreateLocationProfile),
    CONTROLLER.createLocationProfile,
  );
  ChildRouter.post(
    '/admin/profiles/delete',
    authorizationByRole([USER_ROLE.ADMIN]),
    validate.validate(schema.schemaDeleteLocationProfile),
    CONTROLLER.removeLocationProfiles,
  );
  ChildRouter.post(
    '/admin/profiles/update',
    authorizationByRole([USER_ROLE.ADMIN]),
    validate.validate(schema.schemaUpdateLocationProfile),
    CONTROLLER.updateLocationProfile,
  );

  ChildRouter.get(
    '/admin/profiles',
    validate.validate(null, schema.schemaGetLocationProfileQuery),
    authorizationByRole([USER_ROLE.ADMIN]),
    CONTROLLER.getLocationProfile,
  );

  return ChildRouter;
};

module.exports = AdminLocationRoutes();
