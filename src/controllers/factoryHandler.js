const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeature = require('../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async(req,res,next)=>{
    
    const id = req.params.id;
    const doc = await Model.findByIdAndDelete(id);

    if(!doc){
        return next(new AppError(`No ${Model} found for the id`,404))
    }

    res.status(200).json({msg:`Record deleted successfully for ${id}`,data:null})
});

exports.updateOne = Model => catchAsync(async(req,res,next)=>{
    
    const id = req.params.id;
    const doc = await Model.findByIdAndUpdate(id,req.body,{new:true,runValidators:true});
    
    if(!doc){
        return next(new AppError(`No ${Model} found for the id`,404))
    }

    res.status(200).json({data:{doc}})
});


exports.createOne = Model => catchAsync(async(req,res,next)=>{
    
    const newDoc =  await Model.create(req.body);
    
    res.status(200).json({
        status:'success',
        data:{
            newDoc
        }
    });

})

exports.getOne = (Model, populateOptions) => catchAsync(async(req,res,next)=>{

    let query = Model.findById(req.params.id);
    if(populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    // const tour = await Tour.findById(id).populate('reviews');
    // const tour = await Tour.findById(id).populate('guides');
    // const tour = await Tour.findById(id).populate({path:'guides',select:'-__v'});

    if(!doc){
        return next(new AppError('No tour found for the id',404))
    }

    res.status(200).json({data:{doc}})
});


exports.getAll = Model => catchAsync(async(req,res,next)=>{

//To allow for nested GET reviews on Tour (hack)
let filter = {};
if(req.params.tourId) filter = {tour: req.params.tourId};
        const feature = new APIFeature(Model.find(filter), req.query)
                               .filter()
                               .sort()
                               .limitFields()
                               .paginate();
        const doc = await feature.query;
        res.status(200).json({
             status: 'success',
             results: doc.length,
             data:{
                doc
             }  
        })                        

});
