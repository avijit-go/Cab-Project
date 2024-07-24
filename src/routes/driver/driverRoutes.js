/** @format */

const {
  createNewDriver,
  getDrivers,
  searchDriver,
  updateDriverDetails,
  deleteDriverData,
  getDriverById,
} = require("../../controller/driver/driverController");
const verifyAdmin = require("../../middleware/verifyAdmin");
const VerifyAdmin = require("../../middleware/verifyAdmin");
const router = require("express").Router();

/**
 * POST route to create a new driver.
 * Requires admin verification middleware to ensure the user has admin privileges.
 * Calls the createNewDriver function to handle the creation of the driver.
 * @name POST /create
 * @function
 * @memberof router
 * @param {string} path - Express path for creating a new driver
 * @param {Function} middleware - Middleware to verify admin privileges
 * @param {Function} handler - Function to handle the creation of the driver
 */
router.post("/create", VerifyAdmin, createNewDriver);

/**
 * GET route to retrieve the list of drivers.
 * Requires admin verification middleware to ensure the user has admin privileges.
 * Calls the getDrivers function to handle the retrieval of the drivers list.
 * @name GET /list
 * @function
 * @memberof router
 * @param {string} path - Express path for retrieving the drivers list
 * @param {Function} middleware - Middleware to verify admin privileges
 * @param {Function} handler - Function to handle the retrieval of the drivers list
 */
router.get("/list", verifyAdmin, getDrivers);

router.get("/:id", VerifyAdmin, getDriverById);

/**
 * GET route to search for drivers based on query parameters.
 * Requires admin verification middleware to ensure the user has admin privileges.
 * Calls the searchDriver function to handle the driver search operation.
 * @name GET /search-driver
 * @function
 * @memberof router
 * @param {string} path - Express path for the driver search endpoint
 * @param {Function} middleware - Middleware to verify admin privileges
 * @param {Function} handler - Function to handle the driver search operation
 */
router.get("/search-driver", VerifyAdmin, searchDriver);

/**
 * PUT route to update details of a specific driver by its ID.
 * Requires admin verification middleware to ensure the user has admin privileges.
 * Calls the updateDriverDetails function to handle the update of the driver details.
 * @name PUT /update/:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the driver ID
 * @param {Function} middleware - Middleware to verify admin privileges
 * @param {Function} handler - Function to handle the update of the driver details
 */
router.put("/update/:id", VerifyAdmin, updateDriverDetails);

/**
 * DELETE route to delete details of a specific driver by its ID.
 * Requires admin verification middleware to ensure the user has admin privileges.
 * Calls the deleteDriverData function to handle the deletion of the driver details.
 * @name DELETE /delete/:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the driver ID
 * @param {Function} middleware - Middleware to verify admin privileges
 * @param {Function} handler - Function to handle the deletion of the driver details
 */
router.delete("/delete/:id", VerifyAdmin, deleteDriverData);

module.exports = router;
