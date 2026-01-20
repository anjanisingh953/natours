const path = require('path')
const express = require('express');
const bookingController = require('../controllers/bookingController')
const router = express.Router();

router.get('/',bookingController.createBookingCheckout,(req,res)=>{
  res.status(200).sendFile(path.join(__dirname,'../../public/home.html'))
});

router.get('/test',(req,res)=>{
  res.status(200).sendFile(path.join(__dirname,'../../public/test.html'))
});


module.exports = router