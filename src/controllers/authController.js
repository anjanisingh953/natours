const crypto = require('crypto')
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const {promisify} = require('util');
const { token } = require('morgan');
const sendEmail = require('../utils/email');

const signToken = id =>{
    return jwt.sign({id},process.env.JWT_Secret,{expiresIn:'1d'});
}

const createSendToken = (user, statusCode, res)=>{
    const token = signToken(user._id) 
    const cookieOptions = {
        expires: new Date(Date.now() + 9 *24 *60 *60 *1000) ,
        httpOnly:true
    }
    // if(process.env.NODE_ENV == 'production') cookieOptions.secure = true;
    res.cookie('jwt',token,cookieOptions)
    
    //Not display user password in response output
    user.password = undefined ;

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}

//Singup or Create a User
exports.signup = catchAsync(async(req,res,next)=>{
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt
    });

    createSendToken(newUser,201,res);
})

//Login a User
exports.login = catchAsync(async(req,res,next)=>{

    const {email, password} = req.body;
    // 1. check if email and password exists

    if(!email || !password){
      return next(new AppError('Please provide a valid email and password',404));
    }
    // 2. Check if user exists and password is correct
    const user = await User.findOne({email}).select("+password");
    console.log('user',user);
    
    if(!user || !(await user.correctPassword(password,user.password)) ){
        return next(new AppError('Incorrect email or password',401))
    }    
//  3. If everything is ok, send JWT token
    createSendToken(user,201,res);

})

//check token
exports.protect = async(req,res,next)=>{
    let token;
    // 1. Getting token and check of it is there
if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
     token = req.headers.authorization.split(' ')[1]
}
console.log('token protect',token);

    if(!token){
        return next(new AppError('You are not logged in. Please login to access it.',400))
    }
    // 2. verfication token 
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_Secret);
        console.log('decoded ',decoded);
        
    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(
            new AppError('The user belonging to this token is No longer exists.',401)
        )
    }
    // 4. Check if user changed  password after the token was issued
   if(!currentUser.changedPasswordAfter(decoded.iat)){
     return next(new AppError('User recently changed password!. Please login again',401));
   } 

   //GRANT ACCESS TO PROTECTED ROUTE
   req.user = currentUser;

    next();
}

exports.restrictTo = (...roles)=>{

    return (req,res,next)=>{
            console.log('ROLES',req.user.role)
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action',401))
        }
    next();
    }
}


//Forgot Pasword for a user
exports.forgotPassword = async(req,res,next)=>{
    
    // 1. Get user detail based on posted Email
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new AppError('There is no user with this email',401))
    }
    
    // 2. Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});
    
    // 3. Send it to user's email 
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
  
    const message = ` Forgot your password? Submit a PATCH request with your new 
    password and passwordConfirm to: ${resetURL}. \n If you didn't forget your
     password, please ignore this email.`;

    try {
        await sendEmail({
            subject: `Your password reset token (valid for 10 minutes)`,
            message
        })

        res.status(200).json({
            // email: user.email,
            status:'success',
            message:'Token sent to your email'
        })     
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave:false});
        return next(new AppError('There was an error while sending the email. Please try again later!',500))        
    }
}


//Reset password for a user
exports.resetPassword = catchAsync(async(req,res,next)=>{
//   1.Get user based on the token provided
const hashedToken = crypto.createHash('sha256')
                                .update(req.params.token)
                                .digest('hex');

const user = await User.findOne({passwordResetToken:hashedToken, passwordResetExpires:{$gt: Date.now()}});                        

console.log('RESET USER',user)

//   2.If token has not expired, and there is user, set the new password
    if(!user){
        return next(new AppError('Token is invalid or expired',400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

//   3.Update changePasswordAt property for the current user

// 4. Login the user in, send JWT 
    createSendToken(user,201,res);

})

//Update password for loggedIn user
exports.updatePassword =  catchAsync(async(req,res,next)=>{
    // 1. Get user from User.collection
    const user = await User.findById(req.user.id).select('+password');

 
    // 2. Check if Posted current password is Correct
    if(!user.correctPassword(req.body.passwordCurrent, user.password)){
        next(new AppError('Your current password is wrong',401))
    }
 
    // 3. If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4. Log user in, send JWT
    createSendToken(user,201,res);
})