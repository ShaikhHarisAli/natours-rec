const express = require('express');
//const {getAllReviews,createReview,getReview,updateReview,deleteReview,setTourUserIds} = require('../controllers/reviewControllers');
const {getAllReviews,createReview,deleteReview, updateReview,setTourUserIds,getReview} = require('../controllers/reviewControllers');
const {protect,restrictTo} = require('../controllers/authControllers');

const router = express.Router({mergeParams:true});

router.use(protect);


router
  .route('/')
  .get(getAllReviews)
  .post(
    restrictTo('user'),
    setTourUserIds,
    createReview
  );

router.route('/:id').get(getReview).patch(restrictTo('user', 'admin'),updateReview).delete(restrictTo('user', 'admin'),deleteReview);  

// router
//   .route('/:id')
//   .get(getReview)
//   .patch(
//     restrictTo('user', 'admin'),
//     updateReview
//   )
//   .delete(
//     restrictTo('user', 'admin'),
//     deleteReview
//   );

module.exports = router;
