const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const express = require('express');
const router = express.Router()

// router.use((req,res,next)=>{
//    req.requestedTime = new Date().toLocaleDateString();
//    next();
// })

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/forgotpassword',authController.forgotPassword);
router.patch('/resetpassword/:token',authController.resetPassword);

//protect all routes after this middleware, it checks the token available or not
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getSingleUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));
 
router
 .route('/')
 .get(userController.getAllUsers)
 .post(userController.createUser);

router
 .route('/:id')
 .get(userController.getSingleUser)
 .patch(userController.updateSingleUser)
 .delete(userController.deleteSingleUser)


module.exports = router;