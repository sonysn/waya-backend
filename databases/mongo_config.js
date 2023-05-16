const mongoose = require('mongoose');
const { errormessage, info } = require('../ansi-colors-config');


function mongoConnect() {
    mongoose.connect(process.env.MONGODB_LOCAL_URL || process.env.MONGODB_SERVERLESS_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log(info('Connected to MongoDB!'));
    }).catch((err) => {
        console.error(errormessage(`'Error connecting to MongoDB: ${err}`));
    });
}


module.exports = { mongoConnect };