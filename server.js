/* eslint-disable no-console */
const environments = require('custom-env').env();

environments.env(process.env.NODE_ENV || 'local', 'Environments/');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const basicAuth = require('express-basic-auth');
let http = require('http');
const swaggerUi = require('swagger-ui-express');
const useragent = require('express-useragent');
const errorMiddleware = require('./src/Middleware/middlewareError');

const APIDocsJSON = require('./openApiDocumentation.json');
const UserRoutes = require('./src/Users');
const AttendanceRoutes = require('./src/Attendance');

const app = express();
http = http.Server(app);

app.enable('trust proxy');
const connectMongo = require('./Services/MongoDB/mongo');

app.use(useragent.express());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(cookieParser());
app.use(compression({ level: 9 }));
app.use(cors());

// Init for all Environment & connect to all DB ENGINE
connectMongo.connectMongo().then((mongoConnection) => {
  global.rootPath = __dirname;
  global.$hostPath = process.env.HOST_PATH;
  console.log(mongoConnection);

  // Init for swagger API Doc.
  const openApiDocumentation = APIDocsJSON;

  const DisableTryItOutPlugin = () => ({
    statePlugins: {
      spec: {
        wrapSelectors: {
          allowTryItOutFor: () => () => false,
        },
      },
    },
  });

  let options = {};
  if (process.env.NODE_ENV === 'prod') {
    options = {
      swaggerOptions: {
        plugins: [
          DisableTryItOutPlugin,
        ],
      },
    };
  }
  // Collected All Routing API
  app.use('/api-docs', basicAuth({
    users: { 'kayaroll-api-docs': process.env.SWAGGER_PASSWORD },
    challenge: true,
  }), swaggerUi.serve, swaggerUi.setup(openApiDocumentation, options));

  // API Collections
  app.use('/users', UserRoutes);
  app.use('/attendances', AttendanceRoutes);

  app.use(errorMiddleware);

  http.listen(process.env.NODE_SERVER_PORT, () => {
    console.log(`Successfully load config on => ${process.env.NODE_ENV}`);
    console.log(`Successfully connecting server on port => ${process.env.NODE_SERVER_PORT}`);
  });
});
