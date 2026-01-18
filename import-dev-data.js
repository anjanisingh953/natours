const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./src/models/tourModel');
const User = require('./src/models/userModel');
const Review = require('./src/models/reviewModel');
const dotenv = require('dotenv');
dotenv.config({path: './config_secret.env'})
const connectDb = require('./src/db/conn');

connectDb(process.env.DB_URL);

const file_name = 'reviews';

const data = JSON.parse(fs.readFileSync(`./dev-data/data/${file_name}.json`,'utf-8'));
// console.log(data)

const importData = async(Model,data)=>{
    try {
        await Model.create(data,{validateBeforeSave:false});
        console.log(`${Model} data successfully created...`);
    } catch (err) {
        console.log(err)        
    }
    process.exit();
}

// importData(Review,data);