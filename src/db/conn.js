const mongoose = require('mongoose');

const connectDb = async(db)=>{
   try {
     await  mongoose.connect(db)
     console.log('Database connected successfull')
   } catch (err) {
        console.log('DB connection error>>',err.message);
   }
}

module.exports = connectDb;