const ChildRouter = require('express').Router();
const CONTROLLER = require('./controller');
const validate = require('../../Middleware/middlewareValidation');
const schema = require('./validation');

const usersRoutes = () => {
  ChildRouter.get('/healthz', CONTROLLER.ping);
  ChildRouter.post('/register-user', validate.validate(schema.schemaRegisterUser), CONTROLLER.registerUser);
  ChildRouter.post('/register-admin', validate.validate(schema.schemaRegisterAdmin), CONTROLLER.registerAdmin);
  ChildRouter.post('/login', validate.validate(schema.schemaLogin), CONTROLLER.login);
  ChildRouter.post('/register-company', validate.validate(schema.schemaRegisterCompany), CONTROLLER.registerCompany);
  return ChildRouter;
};

module.exports = usersRoutes();
