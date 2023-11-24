const mongoose = require('mongoose');

module.exports.connectMongo = () => new Promise((resolve) => {
  try {
    const connectionURI = `${process.env.MONGO_HOST}${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_NAME}.mongodb.net/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority`;
    global.$mongo = mongoose.connect(
      connectionURI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    resolve(`[ASYNC-START.OK]: Successfully connected to DB / ${new Date()}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error.message);
    resolve(`[ERR]: Error while attempt to connect database / ${new Date()}`);
  }
});
