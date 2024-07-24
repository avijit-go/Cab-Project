/** @format */

const {
  createCarList,
  getCarsList,
  searchCars,
  getCarById,
  updateCarDetails,
  deleteCarDetails,
  getListOfCars,
  getCarsRecomendation
} = require("../../controller/cars/carsController");
const VerifyAdmin = require("../../middleware/verifyAdmin");
const router = require("express").Router();

/**
 * GET route to search for cars based on query parameters.
 * Calls the searchCars function to handle the search operation.
 * @name GET /search-cars
 * @function
 * @memberof router
 * @param {string} path - Express path for the car search endpoint
 * @param {Function} handler - Function to handle the car search operation
 */
router.get("/search-cars", searchCars);

/**
 * POST route to create a new car list.
 * Requires admin verification middleware to ensure the user has admin privileges.
 * Calls the createCarList function to handle the creation of the car list.
 * @name POST /create
 * @function
 * @memberof router
 * @param {string} path - Express path for creating a new car list
 * @param {Function} middleware - Middleware to verify admin privileges
 * @param {Function} handler - Function to handle the creation of the car list
 */
router.post("/create", VerifyAdmin, createCarList);

/**
 * GET route to retrieve the list of cars.
 * Calls the getCarsList function to handle the retrieval of the car list.
 * @name GET /list
 * @function
 * @memberof router
 * @param {string} path - Express path for retrieving the car list
 * @param {Function} handler - Function to handle the retrieval of the car list
 */
router.get("/list", getCarsList);

/**
 * GET route to retrieve details of a specific car by its ID.
 * Calls the getCarById function to handle the retrieval of the car details.
 * @name GET /:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the car ID
 * @param {Function} handler - Function to handle the retrieval of the car details
 */
router.get("/:id", getCarById);

/**
 * PUT route to update details of a specific car by its ID.
 * Requires admin verification middleware to ensure the user has admin privileges.
 * Calls the updateCarDetails function to handle the update of the car details.
 * @name PUT /update/:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the car ID
 * @param {Function} middleware - Middleware to verify admin privileges
 * @param {Function} handler - Function to handle the update of the car details
 */
router.put("/update/:id", VerifyAdmin, updateCarDetails);

/**
 * DELETE route to delete details of a specific car by its ID.
 * Requires admin verification middleware to ensure the user has admin privileges.
 * Calls the deleteCarDetails function to handle the deletion of the car details.
 * @name DELETE /delete/:id
 * @function
 * @memberof router
 * @param {string} path - Express path with a dynamic parameter ":id" representing the car ID
 * @param {Function} middleware - Middleware to verify admin privileges
 * @param {Function} handler - Function to handle the deletion of the car details
 */
router.delete("/delete/:id", VerifyAdmin, deleteCarDetails);
router.get("/", getListOfCars);
router.post("/recomendation", getCarsRecomendation)

module.exports = router;
