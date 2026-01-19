const stripe = require('stripe')(process.env.Stripe_Secret_Key)
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async(req,res,next)=>{

//1. Get the currently booked tour
   const tour = await Tour.findById(req.params.tourId);
 //2. create Checkout Session
   const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: 'http://localhost:8080',
        cancel_url: 'http://localhost:8080',
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items:[
            {
                price_data: {
                currency: 'usd',
                product_data: {
                    name: `${tour.name} Tour`,
                },
                unit_amount: tour.price * 100,
                },
                quantity: 1


            }
        ],
        //Custom fields are optional
        custom_fields:[
            {   
                key:"mycustomField",
                label:{
                    custom:"Select Favorite Shopping Category",
                    type:"custom"
                },
                type:"dropdown",
                dropdown:{
                    options:[
                        {label:"Electronics",value:"electronics"},
                        {label:"Fashion and Lifestyle",value:"clothing"},
                        {label:"Home Decors",value:"homedecor"}
                    ],
                    default_value:"clothing"
                }
            }
        ]

    });

    //3.Create session as Response
    res.status(200).json({
        status: 'success',
        session
    })
})