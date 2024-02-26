const ChildRouter = require('express').Router();
const multer = require('multer');
const os = require('os');
const CONTROLLER = require('../../controllers/attendanceController');
const { authentication, authorizationByRole } = require('../../middlewares/middlewareAuth');

const upload = multer({ dest: os.tmpdir() });
const validate = require('../../middlewares/middlewareValidation');
const schema = require('../../joiSchema/attendanceSchema');
const { USER_ROLE } = require('../../utils/constants');

const AttendanceRoutes = () => {
  ChildRouter.use(authentication);

  ChildRouter.post(
    '/check-in',
    authorizationByRole([USER_ROLE.EMPLOYEE]),
    upload.single('imageFile'),
    validate.validate(schema.schemaAttendance),
    CONTROLLER.attendanceCheckIn,
  );
  ChildRouter.post(
    '/check-out',
    authorizationByRole([USER_ROLE.EMPLOYEE]),
    upload.single('imageFile'),
    validate.validate(schema.schemaAttendance),
    CONTROLLER.attendanceCheckOut,
  );
  ChildRouter.get('/list', validate.validate(null, schema.schemaAttendanceList), CONTROLLER.attendanceList);
  ChildRouter.get('/details', validate.validate(null, schema.schemaEmployeeAttendanceDetails), authorizationByRole([USER_ROLE.EMPLOYEE]), CONTROLLER.employeeAttendanceDetails);
  ChildRouter.get(
    '/admin/dashboard',
    authorizationByRole([USER_ROLE.ADMIN]),
    validate.validate(null, schema.schemaAttendanceListAdmin),
    CONTROLLER.attendanceListAdmin,
  );
  ChildRouter.post('/admin/approval', authorizationByRole([USER_ROLE.ADMIN]), validate.validate(schema.schemaApproval), CONTROLLER.attendanceApproval);
  ChildRouter.put('/admin/update', authorizationByRole([USER_ROLE.ADMIN]), validate.validate(schema.schemaAttendanceUpdate), CONTROLLER.attendanceUpdate);
  ChildRouter.post('/admin/report', authorizationByRole([USER_ROLE.ADMIN]), validate.validate(null, schema.schemaAttendanceReportAdmin), CONTROLLER.attendanceReport);
  ChildRouter.get('/admin/report', authorizationByRole([USER_ROLE.ADMIN]), validate.validate(null, schema.schemaAttendanceSummaryAdmin), CONTROLLER.attendanceSummaryList);
  ChildRouter.post(
    '/admin/create',
    authorizationByRole([USER_ROLE.ADMIN]),
    validate.validate(schema.schemaAdminCreateAttendance),
    CONTROLLER.createAttendance,
  );
  ChildRouter.get('/admin/audit-log/:id', authorizationByRole([USER_ROLE.ADMIN]), CONTROLLER.attendanceAuditLogByAttendanceId);

  ChildRouter.get('/superadmin/report', validate.validate(null, schema.schemaGenerateReportByOrganizationIds), CONTROLLER.reportByOrganizationIds);

  ChildRouter.get('//audit-log/:id', CONTROLLER.attendanceAuditLogByAttendanceId);
  ChildRouter.get('/:id', CONTROLLER.attendanceDetailById);
  return ChildRouter;
};

module.exports = AttendanceRoutes();
