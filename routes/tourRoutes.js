const express = require('express');
const {getAllTours,createTour,getTour,updateTour,deleteTour,aliasTopTours,getTourStats,getMonthlyPlan,getToursWithin,getDistances,uploadTourImages,resizeTourImages} = require('../controllers/tourControllers');
const {protect,restrictTo} = require('../controllers/authControllers');
// const {createReview,getAllReviews} = require("../controllers/reviewControllers")
const reviewRouter = require('./reviewRoutes')

const router = express.Router()

//router.param('id', checkId)
router.use('/:tourId/reviews',reviewRouter)

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(protect,restrictTo('admin','lead-guide'),getMonthlyPlan);
router.route('/top-5-cheap').get(aliasTopTours,getAllTours)

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router.route('/').get(getAllTours).post(protect,restrictTo('admin','lead-guide'),createTour);
router.route('/:id').get(getTour).patch(protect,restrictTo('admin','lead-guide'),uploadTourImages,resizeTourImages,updateTour).delete(protect,restrictTo('admin','lead-guide'), deleteTour);






module.exports = router