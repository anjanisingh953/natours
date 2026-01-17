const AppError = require('../utils/appError')

const handleCastErrorDB = (err,next) =>{
    const message = `Invalid  ${err.path}: ${err.value}`;
    return new AppError(message,400);
}

const handleDuplicateFieldsErrorDB = err =>{
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value : ${value} . Please use another value`;
    return new AppError(message, 400);
}

const handleValidationErroDB =  err =>{
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
}
const handleJWTError = () =>new AppError('Invalid Token. Please login again!',401)

const handleTokenExpiredError = () => new AppError('Your token has expired.Please login again.',401)

const sendErrorDev = (err,res)=>{
        res.status(err.statusCode).json({
        status: err.status,
        msg: err.message,
        error:err,
        stack:err.stack
        })  
}

const sendErrorProd = (err,res)=>{
    console.log('err.isOperational ==============',err.isOperational)
    if(err.isOperational){
      res.status(err.statusCode).json({
        status: err.status,
        msg: err.message
      })
    }else{
       //1.Log error
       console.log('New Unknown Error >>>',err);
       
       //2.send generic message to the users 
       res.status(500).json({
         status: 'error',
         msg: 'Something went very wrong'
       })
    }

}
module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV == 'Development'){
        sendErrorDev(err,res)
    }else if(process.env.NODE_ENV == 'Production'){
       let error = {...err};
        if(err.name === 'CastError') error = handleCastErrorDB(err);
        if(err.code === 11000) error = handleDuplicateFieldsErrorDB(err);
        if(err.name === 'ValidationError') error = handleValidationErroDB(err);
        if(err.name === 'JsonWebTokenError') error = handleJWTError();
        if(err.name === 'TokenExpiredError') error = handleTokenExpiredError();

        sendErrorProd(error,res)
    }



}