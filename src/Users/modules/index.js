const ChildRouter = require('express').Router();
const CONTROLLER = require('./controller');
const validate = require('../../Middleware/middlewareValidation');
const schema = require('./validation');
const { authentication } = require('../../Middleware/middlewareAuth');

const usersRoutes = () => {
  ChildRouter.get('/healthz', CONTROLLER.ping);
  ChildRouter.post('/login', validate.validate(schema.schemaLogin), CONTROLLER.login);
  ChildRouter.post('/register', validate.validate(schema.schemaRegister), CONTROLLER.register);
  ChildRouter.post('/register-company', validate.validate(schema.schemaRegisterCompany), CONTROLLER.registerCompany);
  ChildRouter.use(authentication);
  ChildRouter.get('/admin/employee-list', CONTROLLER.employeeList);

  return ChildRouter;
};

module.exports = usersRoutes();
