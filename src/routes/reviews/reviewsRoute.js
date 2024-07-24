const router = require("express").Router();
const { createReview, getAllreviews, updateReview, deleteReview, getBookingReview } = require("../../controller/reviews/reviewsController");
const authentication = require("../../middleware/authentication");
const Authentication = require("../../middleware/authentication");
const VerifyAdmin = require("../../middleware/verifyAdmin");

/**
 * POST route to create a new review for a specific car.
 * Requires authentication middleware to ensure the user is logged in.
 * Calls the createReview function to handle the creation of the review.
 * @name POST /create/:carId
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":carId" representing the car ID
 * @param {Function} middleware - Authentication middleware to verify user session
 * @param {Function} handler - Function to handle the creation of the review
 */
router.post("/create/:carId", Authentication, createReview);

/**
 * GET route to retrieve all reviews for a specific car by its ID.
 * Calls the getAllReviews function to handle the retrieval of all reviews for the car.
 * @name GET /:carId
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":carId" representing the car ID
 * @param {Function} handler - Function to handle the retrieval of all reviews for the car
 */
router.get("/:carId", getAllreviews);

/**
 * PATCH route to update a review by its ID.
 * Requires authentication middleware to ensure the user is logged in.
 * Calls the updateReview function to handle the update of the review.
 * @name PATCH /update/:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the review ID
 * @param {Function} middleware - Authentication middleware to verify user session
 * @param {Function} handler - Function to handle the update of the review
 */
router.patch("/update/:id",Authentication, updateReview);

/**
 * DELETE route to delete a review by its ID.
 * Requires authentication middleware to ensure the user is logged in.
 * Calls the deleteReview function to handle the deletion of the review.
 * @name DELETE /delete/:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the review ID
 * @param {Function} middleware - Authentication middleware to verify user session
 * @param {Function} handler - Function to handle the deletion of the review
 */
router.delete("/delete/:id",Authentication, deleteReview);

router.get("/single/:carId", authentication, getBookingReview)

module.exports = router;