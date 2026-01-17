const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const factory = require('../controllers/factoryHandler');

//filter function
const filterObj = (obj, ...allowedFields)=>{
    let newObj = {};
    Object.keys(obj).forEach((el)=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}


exports.createUser = catchAsync(async(req,res)=>{
      res.status(200).json({
        status:'success',
        results: 'This route is not defined. please use /signup instead',
        data:{users}
    })
})

exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next()
};

//update logged in user details except Password
exports.updateMe = catchAsync(async(req,res,next)=>{
        //1. Create error if user POSTs password data
        if(req.body.password || req.body.passwordConfirm){
            return next(new AppError('This route is not for password update. Please use /updateMyPassword route.',400))
        }
        
        //2.Filter the allowed fields to from requestBody update the user data 
        const filteredBody =  filterObj(req.body,'name','email');
        
        //3.update user other details except password
        const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
            new:true,
            runValidators:true
        });


        res.status(200).json({ status:'success',data:{user:updatedUser}})
});


exports.deleteMe = catchAsync(async(req,res)=>{
 await User.findByIdAndUpdate(req.user.id,{active:false})
 res.status(200).json({status:'success',data:null});
});


exports.getAllUsers = factory.getAll(User);
exports.getSingleUser = factory.getOne(User)
//Do NOT update password with this
exports.updateSingleUser = factory.updateOne(User)
exports.deleteSingleUser = factory.deleteOne(User)