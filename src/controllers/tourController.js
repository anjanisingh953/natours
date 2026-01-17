const Tour = require('../models/tourModel');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');
const APIFeature = require('../utils/apiFeatures');

// exports.getTour = catchAsync(async(req,res,next)=>{


//      //Build query
//        //1. Filtering
//         const queryObj = {...req.query};
//         const excludedFields = ['sort','page','limit','fields'];
//         excludedFields.forEach((el)=> delete queryObj[el]);
       
//          //2 Advance Filtering   
//         let queryStr = JSON.stringify(queryObj);
//         queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g,match=> `$${match}`);         
        
//         let query =  Tour.find(JSON.parse(queryStr));
        
//         if(req.query.sort){
//             const sortBy = req.query.sort.split(',').join(' ');
//             query = query.sort(sortBy);
//         }else{
//             query = query.sort('-createdAt');
//         }

//         if(req.query.fields){
//             const selectedFields = req.query.fields.split(',').join(' ');
//             query = query.select(selectedFields);
//         }else{
//             query = query.select('-__v');
//         }
        
//        //2. Execute query
//         const tours = await query;

//         res.status(200).json({TotalTours:tours.length,data:{tours}})

// });



exports.getTourStats = catchAsync(async(req,res,next)=>{
    
    const stats = await Tour.aggregate([
        {$match:{duration:{$gte:5}}},
        {$group:{
            // _id:'$difficulty',
            _id:null,
            tourCounts:{$sum:1},
            averagePrice:{$avg:'$price'},
            totalPrice:{$sum:'$price'},
            
        }},
        // {$sort:{tourCounts:-1}}
    ]);
    
    res.status(200).json({data:{stats}})
});

exports.getMonthlyPlan = catchAsync(async(req,res,next)=>{
    
    const year = req.params.year * 1 ;
    const stats = await Tour.aggregate([
        {$unwind:'$startDates'},
        {$match:{
            startDates:{
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
            }
        }},
        {
            $group:{
                _id:{$month:'$startDates'},
                tourCount:{$sum:1},
                tours:{$push:'$tourName'}
            }
        },
        {
            $addFields:{month:'$_id'}
        },
        {
            $project:{
                _id:0
            }
        },
        {
            $sort:{
                tourCount:-1
            }
            
        }
    ]);
    
    res.status(200).json({data:{stats}})
});

exports.getTours = factory.getAll(Tour);
exports.getSingleTour = factory.getOne(Tour,{ path:'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);