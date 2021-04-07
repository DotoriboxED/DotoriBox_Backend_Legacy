// const mongoose = require('mongoose');
// const autoIncrement = require('mongoose-auto-increment');
import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment'
import dotenv from 'dotenv';
import path from 'path';
import surveySchema from './schema/survey';
import userSchema from './schema/user';
import productSchema from './schema/sample';

dotenv.config({ path: path.join(process.cwd(), '.env') })

// mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI as string, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

autoIncrement.initialize(mongoose.connection);

// const surveySchema = require('./schema/survey')(mongoose, autoIncrement);
const db = {...surveySchema(autoIncrement), ...userSchema(), ...productSchema(autoIncrement)};

export default db;