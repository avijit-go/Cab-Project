/** @format */

const router = require("express").Router();
const {
  createBookingCab,
  getUserBookingList,
  getSingleBookingDetails,
  updateBookingDetails,
  getBookingList,
  cancelBooking,
  claimToken,
  acceptingBooking,
  cancelRideFromAdmin,
  getAllBookingList,
  confirmBooking,
  cancelBookingList,
  getPendinCarList,
  getActiveCarList,
  getInactiveCarList,
  getCancelCarList
} = require("../../controller/bookcab/bookCabController");
const Authentication = require("../../middleware/authentication");
const VerifyAdmin = require("../../middleware/verifyAdmin");
const AdminNotification = require("../../model/notification/adminNotification")

/**
 * POST route to create a new booking for a cab ride.
 * Requires authentication middleware to ensure the user is logged in.
 * Calls the createBookingCab function to handle the creation of the booking.
 * @name POST /create
 * @function
 * @memberof router
 * @param {string} path - Express path
 * @param {Function} middleware - Authentication middleware to verify user session
 * @param {Function} handler - Function to handle the creation of the booking
 */
router.post("/create", Authentication, createBookingCab);

router.get("/get-pending-list", Authentication, getPendinCarList)
router.get("/get-active-list", Authentication, getActiveCarList)
router.get("/get-inactive-list", Authentication, getInactiveCarList)
router.get("/get-cancel-list", Authentication, getCancelCarList)

router.post("/confirm-booking", Authentication, confirmBooking)

/**
 * PUT route to update details of a specific booking.
 * Requires authentication middleware to ensure the user is logged in.
 * Calls the updateBookingDetails function to handle the updating of the booking details.
 * @name PUT /update-details/:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the booking ID
 * @param {Function} middleware - Authentication middleware to verify user session
 * @param {Function} handler - Function to handle the updating of the booking details
 */
router.put("/update-details/:id", Authentication, updateBookingDetails);

router.put("/cancel/:id", Authentication, cancelBooking);

/**
 * GET route to retrieve a list of bookings associated with the logged-in user.
 * Requires authentication middleware to ensure the user is logged in.
 * Calls the getUserBookingList function to handle the retrieval of the user's booking list.
 * @name GET /user-booking-list
 * @function
 * @memberof router
 * @param {string} path - Express path
 * @param {Function} middleware - Authentication middleware to verify user session
 * @param {Function} handler - Function to handle the retrieval of the user's booking list
 */
router.get("/user-booking-list", Authentication, getUserBookingList);

router.get("/car-list-for-admin", getAllBookingList);

/**
 * GET route to retrieve a list of all bookings.
 * Requires authentication middleware to ensure the user is logged in.
 * Calls the getBookingList function to handle the retrieval of the booking list.
 * @name GET /booking-list
 * @function
 * @memberof router
 * @param {string} path - Express path
 * @param {Function} middleware - Authentication middleware to verify user session
 * @param {Function} handler - Function to handle the retrieval of the booking list
 */
router.get("/list", Authentication, getBookingList);
router.get("/cancel-list", VerifyAdmin, cancelBookingList)
/**
 * GET route to retrieve details of a specific booking by its ID.
 * Requires authentication middleware to ensure the user is logged in.
 * Calls the getSingleBookingDetails function to handle the retrieval of the booking details.
 * @name GET /:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the booking ID
 * @param {Function} middleware - Authentication middleware to verify user session
 * @param {Function} handler - Function to handle the retrieval of the booking details
 */
router.get("/:id", Authentication, getSingleBookingDetails);

/**
 * PUT route to claim a token for a specific booking by its ID.
 * Requires authentication middleware to ensure the user is logged in.
 * Calls the claimToken function to handle the claiming of the token.
 * @name PUT /claim/:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the booking ID
 * @param {Function} middleware - Authentication middleware to verify user session
 * @param {Function} handler - Function to handle the claiming of the token
 */
router.put("/claim/:id", Authentication, claimToken); // pass booking id as parameter

/**
 * PUT route to accept a booking by its ID.
 * Requires admin verification middleware to ensure the user has admin privileges.
 * Calls the acceptingBooking function to handle the acceptance of the booking.
 * @name PUT /accept-booking/:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the booking ID
 * @param {Function} middleware - Middleware to verify admin privileges
 * @param {Function} handler - Function to handle the acceptance of the booking
 */
router.put("/accept-booking/:id", VerifyAdmin, acceptingBooking);

/**
 * PUT route to cancel a ride by its ID, initiated by an admin.
 * Requires admin verification middleware to ensure the user has admin privileges.
 * Calls the cancelRideFromAdmin function to handle the cancellation of the ride.
 * @name PUT /cancel-ride-admin/:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the ride ID
 * @param {Function} middleware - Middleware to verify admin privileges
 * @param {Function} handler - Function to handle the cancellation of the ride
 */
router.put("/cancel-ride-admin/:id", VerifyAdmin, cancelRideFromAdmin);



module.exports = router;
