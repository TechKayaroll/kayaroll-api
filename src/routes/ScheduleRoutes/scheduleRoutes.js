const ChildRouter = require('express').Router();
const CONTROLLER = require('../../controllers/scheduleController');
const { authentication, authorizationByRole } = require('../../middlewares/middlewareAuth');
const schema = require('../../joiSchema/scheduleSchema');
const validate = require('../../middlewares/middlewareValidation');
const { USER_ROLE } = require('../../utils/constants');

const ScheduleRoutes = () => {
  ChildRouter.use(authentication);

  ChildRouter.post(
    '/admin/create',
    validate.validate(schema.schemaCreateSchedule),
    authorizationByRole([USER_ROLE.ADMIN]),
    CONTROLLER.createSchedule,
  );
  // ChildRouter.post(
  //   '/update/:scheduleId',
  //   validate.validate(null, schema.schemaSearchLocation),
  //   authorizationByRole([USER_ROLE.ADMIN]),
  //   CONTROLLER.createSchedule,
  // );

  ChildRouter.post(
    '/admin/delete',
    validate.validate(schema.schemaDeleteSchedule),
    authorizationByRole([USER_ROLE.ADMIN]),
    CONTROLLER.deleteSchedules,
  );

  ChildRouter.post(
    '/admin/set-default/:scheduleId',
    validate.validate(schema.schemaSetDefaultSchedule),
    authorizationByRole([USER_ROLE.ADMIN]),
    CONTROLLER.setDefaultScheduleById,
  );
  ChildRouter.get(
    '/admin/list',
    validate.validate(null, schema.schemaGetScheduleListQuery),
    authorizationByRole([USER_ROLE.ADMIN]),
    CONTROLLER.getScheduleList,
  );

  return ChildRouter;
};

module.exports = ScheduleRoutes();
