const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(e => console.log(err));

autoIncrement.initialize(mongoose.connection);

const surveySchema = require('./schema/survey')(mongoose, autoIncrement);
const db = Object.assign({}, surveySchema);

module.exports = db;