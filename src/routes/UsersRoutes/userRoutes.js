const ChildRouter = require('express').Router();
const CONTROLLER = require('../../controllers/userController');
const validate = require('../../middlewares/middlewareValidation');
const schema = require('../../joiSchema/userSchema');
const { authentication } = require('../../middlewares/middlewareAuth');

const userRoutes = () => {
  ChildRouter.get('/healthz', CONTROLLER.ping);
  ChildRouter.post('/login', validate.validate(schema.schemaLogin), CONTROLLER.login);
  ChildRouter.post('/register', validate.validate(schema.schemaRegister), CONTROLLER.register);
  ChildRouter.post('/register-company', validate.validate(schema.schemaRegisterCompany), CONTROLLER.registerCompany);
  ChildRouter.use(authentication);
  ChildRouter.get('/admin/employee-list', CONTROLLER.employeeList);
  ChildRouter.get('/organization', CONTROLLER.organizationList);
  return ChildRouter;
};

module.exports = userRoutes();
