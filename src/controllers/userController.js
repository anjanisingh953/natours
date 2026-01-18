const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const factory = require('../controllers/factoryHandler');

// const multerStorage = multer.diskStorage({
//     destination: (req,file,cb)=>{
//         cb(null,'public/img/users')
//     },
//     filename: (req,file,cb)=>{
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `${Date.now()}.${ext}`)
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an image! Please upload only images',400),false)
    }
}


const upload = multer({ 
                    storage: multerStorage,
                    fileFilter: multerFilter
               }); 


exports.uploadSingleFile = upload.single('photo')

//Middleware to resize(width*height) the photo, it require file store in memory(bufferfile)
exports.resizeUserPhoto = async(req, res, next)=>{
    if(!req.file) return next();

    req.file.filename = `${Date.now()}.jpeg`;

await sharp(req.file.buffer)
        .resize(150,150)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)
   next()
}

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
    console.log('req FILE',req.file);
    console.log('req body',req.body);
    
        //1. Create error if user POSTs password data
        if(req.body.password || req.body.passwordConfirm){
            return next(new AppError('This route is not for password update. Please use /updateMyPassword route.',400))
        }
        
        //2.Filter the allowed fields to from requestBody update the user data 
        let filteredBody =  filterObj(req.body,'name','email');
        if(req.file) filteredBody.photo = req.file.filename;
        
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