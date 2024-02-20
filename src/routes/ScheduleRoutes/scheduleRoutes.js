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

  ChildRouter.post(
    '/admin/update/:scheduleId',
    validate.validate(schema.schemaUpdateScheduleById),
    authorizationByRole([USER_ROLE.ADMIN]),
    CONTROLLER.updateScheduleById,
  );

  ChildRouter.post(
    '/admin/delete',
    validate.validate(schema.schemaDeleteSchedule),
    authorizationByRole([USER_ROLE.ADMIN]),
    CONTROLLER.deleteSchedules,
  );

  ChildRouter.post(
    '/admin/set-default/:scheduleId',
    authorizationByRole([USER_ROLE.ADMIN]),
    CONTROLLER.setDefaultScheduleById,
  );

  ChildRouter.get(
    '/admin/list',
    validate.validate(null, schema.schemaGetScheduleListQuery),
    authorizationByRole([USER_ROLE.ADMIN]),
    CONTROLLER.getScheduleList,
  );

  ChildRouter.get(
    '/admin/detail/:scheduleId',
    authorizationByRole([USER_ROLE.ADMIN]),
    CONTROLLER.getScheduleDetail,
  );

  return ChildRouter;
};

module.exports = ScheduleRoutes();
