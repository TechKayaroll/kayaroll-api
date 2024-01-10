const ChildRouter = require('express').Router();
const { authentication } = require('../../middlewares/middlewareAuth');

const CONTROLLER = require('../../controllers/organizationController');
// const upload = multer({ dest: os.tmpdir() });
const validate = require('../../middlewares/middlewareValidation');
const schema = require('../../joiSchema/organizationSchema');

const OrganizationRoutes = () => {
  ChildRouter.use(authentication);
  ChildRouter.get('/all', validate.validate(null, schema.schemaAllOrganization), CONTROLLER.getAllOrganization);
  return ChildRouter;
};

module.exports = OrganizationRoutes();
