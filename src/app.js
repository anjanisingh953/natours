const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

// router.use((req,res,next)=>{
//    req.requestedTime = new Date().toLocaleDateString();
//    next();
// })

app.use(express.urlencoded({ extended: true }))
app.use(helmet());
const morgan = require('morgan');

console.log('>>>>',process.env.NODE_ENV);
app.use(morgan('dev'))

const limiter = rateLimit({
  max:10,
  windowMs: 60 * 60 * 60, //1hours
  message: 'Too many requests from this IP, please try again after 1 hours'
})
//To get nested Object from req.query
app.set('query parser', 'extended');

app.use('/api',limiter);

//Limit the size of req body
app.use(express.json({limit: '10000kb'}));

//Data sanitization against NoSql query injections
// app.use(mongoSanitize());

//Data sanitization against XSS cross-site-scripting attacks
// app.use(xss())

//Prevent parameter pollution
app.use(hpp({
    whitelist:[
      'duration', 'ratingQuantity','ratingAverage','maxGroupSize',
      'difficulty','price'
    ]
}))
app.use('/api/v1/users/',userRouter);
app.use('/api/v1/tours/',tourRouter);
app.use('/api/v1/reviews/',reviewRouter);
app.use('/api/v1/bookings/',bookingRouter);

app.use('/',(req,res)=>{
  res.status(200).json({status:'success',message:"Welcome to Natours Home"})
})

app.all(/.*/,(req,res,next)=>{
//   const err = new Error(`Can't find ${req.originalUrl} on this server`);
//   err.status = 'fail';
//   err.statusCode = 404


  next(new AppError(`Can't find ${req.originalUrl} on this server`,404  ))
})


app.use(globalErrorHandler)

module.exports = app;