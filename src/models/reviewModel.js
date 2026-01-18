const mongoose = require('mongoose')
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        requird: [true, 'Review can not be empty']
    },
    rating:{
        type: Number,
        min:1,
        max:5,
        default:0
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    tour:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true,'Review must belong to a tour.']
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'Review must belong to a user.']
    }
},{
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
});

reviewSchema.index({tour: 1, user: 1 },{unique:true})


reviewSchema.pre(/^find/, function(){
    this.populate({
        path:'user',
        select:'name email'
    })

})

reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([    
         {
           $match:{tour:tourId}
         },
         {
            $group:{
                _id: '$tour',
                nRating: { $sum:1 },
                avgRating: { $avg: '$rating'}    
            }
         }
    ])
    // console.log(stats)
    if(stats.length >0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingQuantity: stats[0].nRating,
            ratingAverage: stats[0].avgRating
        })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingQuantity: 0,
            ratingAverage: 4.5
        })
    }

}

reviewSchema.post('save',function(){
    // this point to current review
    this.constructor.calcAverageRatings(this.tour)
})


//findbyIdAndUpdate
//findbyIdAndDelete

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne();
    console.log(this.r)
})

reviewSchema.post(/^findOneAnd/, async function(next){
   await this.r.constructor.calcAverageRatings(this.r.tour)
})



const Review = mongoose.model('Review',reviewSchema);
module.exports = Review;