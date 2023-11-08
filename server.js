(async function() {
    const environments = require('custom-env').env();
    environments.env(process.env.NODE_ENV || 'local','Environments/');
    const express = require('express');
    const compression = require('compression');
    const bodyParser = require('body-parser');
    const cookieParser = require('cookie-parser');
    const cors = require('cors');
    const basicAuth = require('express-basic-auth');
    const errorMiddleware = require('./src/Middleware/middlewareError');

    const app = express();
    app.enable('trust proxy')
    const http = require('http').Server(app);
    const connectMongo = require('./Services/MongoDB/mongo');

    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(cookieParser());
    app.use(compression({ level: 9 }));
    app.use(cors());

    //Init for all Environment & connect to all DB ENGINE
    let conMongo = await connectMongo.connectMongo();
    global.rootPath = __dirname;
    global.$hostPath = process.env.HOST_PATH;
    console.log(conMongo);

    // Init for swagger API Doc.
    const swaggerUi = require('swagger-ui-express');
    const openApiDocumentation = require('./openApiDocumentation.json');
    const DisableTryItOutPlugin = function() {
        return {
            statePlugins: {
                spec: {
                    wrapSelectors: {
                        allowTryItOutFor: () => () => false
                    }
                }
            }
        }
    }

    const options = {
        swaggerOptions: {
            plugins: [
                DisableTryItOutPlugin
            ]
        }
    };

    //Collected All Routing API
    app.use('/api-docs', basicAuth({
        users: {'kayaroll-api-docs': process.env.SWAGGER_PASSWORD},
        challenge: true}), swaggerUi.serve, swaggerUi.setup(openApiDocumentation, options));
    app.use('/users', require('./src/Users'));
    app.use('/attendances', require('./src/Attendance'));
    app.use(errorMiddleware);

    http.listen(process.env.NODE_SERVER_PORT, () => {
        console.log(`Successfully load config on => ${process.env.NODE_ENV}`)
        console.log(`Successfully connecting server on port => ${process.env.NODE_SERVER_PORT}`)
    });
})();