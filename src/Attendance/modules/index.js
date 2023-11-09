const ChildRouter = require('express').Router();
const multer = require('multer');
const CONTROLLER = require('./controller');
const { authMiddleware } = require('../../Middleware/middlewareAuth');

// const upload = multer({ dest: `${__dirname}/file/attendance/` });
const upload = multer({ dest: `/tmp` });
const validate = require('../../Middleware/middlewareValidation');
const schema = require('./validation');

const AttendanceRoutes = () => {
  ChildRouter.use(authMiddleware);
  ChildRouter.post('/check-in', upload.single('imageFile'), validate.validate(schema.schemaAttendance), CONTROLLER.attendanceCheckIn);
  ChildRouter.post('/check-out', upload.single('imageFile'), validate.validate(schema.schemaAttendance), CONTROLLER.attendanceCheckOut);
  ChildRouter.get('/list', validate.validate(null, schema.schemaAttendanceList), CONTROLLER.attendanceList);
  ChildRouter.get('/admin/dashboard', validate.validate(null, schema.schemaAttendanceListAdmin), CONTROLLER.attendanceListAdmin);
  ChildRouter.post('/admin/approval', validate.validate(schema.schemaApproval), CONTROLLER.attendanceApproval);
  ChildRouter.put('/admin/update', validate.validate(schema.schemaAttendanceUpdate), CONTROLLER.attendanceUpdate);

  return ChildRouter;
};

module.exports = AttendanceRoutes();
