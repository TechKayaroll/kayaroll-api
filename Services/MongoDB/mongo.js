const mongoose = require("mongoose");
const Console = require("console");

module.exports.connectMongo = () => {
    return new Promise((resolve) => {
        try {
            global.$mongo = mongoose.connect(`${process.env.MONGO_HOST}${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_NAME}.l7kdbcx.mongodb.net/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority`,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
            resolve(`[ASYNC-START.OK]: Successfully connected to DB / ${new Date()}`);
        } catch (error) {
            console.log(error.message)
            resolve(`[ERR]: Error while attempt to connect database / ${new Date()}`);
        }
    })
}