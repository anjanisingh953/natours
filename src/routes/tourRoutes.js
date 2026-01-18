const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');

const express = require('express');
const router = express.Router()

// POST /tour/12333/reviews
// GET /tour/12333/reviews
// GET /tour/12333/reviews/:id

// router
//  .route('/:tourId/reviews')
//  .post(
//        authController.protect,
//        authController.restrictTo('user'),
//        reviewController.createReview
//      ); 
router.use('/:tourId/reviews',reviewRouter)


 
router
 .route('/')
 .get(tourController.getTours)
 .post(
        authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.createTour
    )
 
 router
 .route('/tour-stats').get(tourController.getTourStats)
router
 .route('/monthly-plan/:year')
 .get(
       authController.protect,
       authController.restrictTo('admin','lead-guide','guide'),   
       tourController.getMonthlyPlan
    )

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin)  

router
  .route('/:distances/:latlng/unit/:unit')
  .get(tourController.getDistances)  

router
 .route('/:id')
 .get(tourController.getSingleTour)
 .patch(
         authController.protect,
         authController.restrictTo('admin','lead-guide'), 
         tourController.uploadTourImages,
         tourController.resizeTourImages,   
         tourController.updateTour
       )
 .delete(
         authController.protect,
         authController.restrictTo('admin','lead-guide'),
         tourController.deleteTour
        )



module.exports = router;