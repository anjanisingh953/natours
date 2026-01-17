const mongoose = require('mongoose');
// const User = require('./userModel');
const slugify = require('slugify');
const validator = require('validator')
const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A tour must a name'],
        unique:true,
        // validate: [validator.isAlpha,'Tour name must only contain characters']
    },
    slug:String,
    duration:{
        type:Number,
        required:[true, 'A tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true, 'A tour must have a group size']
    },
    difficulty:{
        type:String,
        enum:{
            values:['easy','medium','difficult'],
            message:'Diffculty can be easy, medium, difficult'
        },
        required:[true, 'A tour must have a difficulty']
    },
    ratingAverage:{
        type:Number,
        default:4.5,
        min:1,
        max:5
    },
    ratingQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A tour must have a price']
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                return val < this.price
            },
            message:'discount price ({VALUE}) should be less than price'
        }
    },
    summary:{
        type:String,
        trim:true,
        require:[true,'A tour must have a summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        // required:[true, 'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation:{
        type:{
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations:[
        {
            type:{
                 type: String,
                 default: 'Point',
                 enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }

    ]
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

tourSchema.virtual('durationWeeks').get(function(){
    return Math.ceil(this.duration/7) 
})

tourSchema.virtual('reviews',{
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})


//Document middleware
tourSchema.pre('save', async  function() {
    this.slug = slugify(this.name,{lower:true})
});

// tourSchema.pre('save',async function(){
//     const guidePromises = this.guides.map(async(id)=> await User.findById(id));
//     this.guides = await Promise.all(guidePromises);
// })


//QueryMiddleware
tourSchema.pre(/^find/, function(){
    this.find({secretTour:{$ne:true}})
})
tourSchema.pre(/^find/, function(){
    this.populate({path:'guides',select:'-__v'})
})



//AggregateMiddleware
tourSchema.pre('aggregate',async function(){
    this.pipeline().unshift({ $match:{secretToyr:{$ne:true}} });
})


const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;