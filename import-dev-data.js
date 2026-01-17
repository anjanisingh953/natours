const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./src/models/tourModel');
const dotenv = require('dotenv');
dotenv.config({path: './config_secret.env'})
const connectDb = require('./src/db/conn');

connectDb(process.env.DB_URL);

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours.json','utf-8'));
console.log(tours)

const importData = async()=>{
    try {
        await Tour.create(tours);
        console.log('Data successfully loaded');
    } catch (err) {
        console.log(err)        
    }
    process.exit();
}

importData();