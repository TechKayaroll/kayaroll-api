const ChildRouter = require('express').Router();
const CONTROLLER = require('../../controllers/locationController');
const { authentication } = require('../../middlewares/middlewareAuth');
const schema = require('../../joiSchema/locationSchema');
const validate = require('../../middlewares/middlewareValidation');

const LocationRoutes = () => {
  ChildRouter.get('/', (req,res,next) => { res.json({ ok: '200'})});
  return ChildRouter;
};

module.exports = LocationRoutes();
