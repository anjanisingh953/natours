const dotenv = require('dotenv');
dotenv.config({path: './config_secret.env'})
const app = require('./src/app');
const  connectDb= require('./src/db/conn')
const PORT = process.env.port || 8080;

connectDb(process.env.DB_URL);
app.listen(PORT,()=>console.log(`Your server is listening at ${PORT}`))