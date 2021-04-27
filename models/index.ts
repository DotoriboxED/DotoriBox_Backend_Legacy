// const mongoose = require('mongoose');
// const autoIncrement = require('mongoose-auto-increment');
import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment'
import dotenv from 'dotenv';
import path from 'path';
import surveySchema from './schema/survey';
import userSchema from './schema/user';
import itemSchema from './schema/sample';
import productSchema from './schema/product';
import dns from 'dns';
import isWsl from 'is-wsl';

dotenv.config({ path: path.join(process.cwd(), '.env') })

if (isWsl) {
    mongoose.connect('mongodb://' + dns.getServers()[0] +':27017/' + process.env.MONGO_DBNAME, 
    {
        auth: {
            user: process.env.MONGO_USERNAME as string,
            password: process.env.MONGO_PASSWORD as string
        }, 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    })
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.log(err));
} else {
    mongoose.connect(process.env.MONGO_URI as string, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.log(err));
}
// mongoose.Promise = global.Promise;

mongoose.set('useCreateIndex', true);
autoIncrement.initialize(mongoose.connection);

// const surveySchema = require('./schema/survey')(mongoose, autoIncrement);
const db = {...surveySchema(autoIncrement), 
    ...userSchema(), 
    ...itemSchema(autoIncrement),
    ...productSchema(autoIncrement)
};

export default db;