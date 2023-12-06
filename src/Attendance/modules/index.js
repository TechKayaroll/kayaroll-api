const ChildRouter = require('express').Router();
const multer = require('multer');
const os = require('os');
const CONTROLLER = require('./controller');
const { authentication } = require('../../Middleware/middlewareAuth');

const upload = multer({ dest: os.tmpdir() });
const validate = require('../../Middleware/middlewareValidation');
const schema = require('./validation');

const AttendanceRoutes = () => {
  ChildRouter.use(authentication);
  ChildRouter.post('/check-in', upload.single('imageFile'), validate.validate(schema.schemaAttendance), CONTROLLER.attendanceCheckIn);
  ChildRouter.post('/check-out', upload.single('imageFile'), validate.validate(schema.schemaAttendance), CONTROLLER.attendanceCheckOut);
  ChildRouter.get('/list', validate.validate(null, schema.schemaAttendanceList), CONTROLLER.attendanceList);

  ChildRouter.get('/admin/dashboard', validate.validate(null, schema.schemaAttendanceListAdmin), CONTROLLER.attendanceListAdmin);
  ChildRouter.post('/admin/approval', validate.validate(schema.schemaApproval), CONTROLLER.attendanceApproval);
  ChildRouter.put('/admin/update', validate.validate(schema.schemaAttendanceUpdate), CONTROLLER.attendanceUpdate);
  ChildRouter.post('/admin/report', validate.validate(null, schema.schemaAttendanceReportAdmin), CONTROLLER.attendanceReport);

  ChildRouter.get('/:id', CONTROLLER.attendanceDetailById);
  return ChildRouter;
};

module.exports = AttendanceRoutes();
