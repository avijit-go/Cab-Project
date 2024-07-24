/** @format */

const router = require("express").Router();
const {
  userRegister,
  loginUser,
  updateProfileImage,
  updateProfileName,
  updateProfileEmail,
  updateProfileAddress,
  updateProfilePassword,
  verifyEmail,
  forgetPassword,
  forgetUpdatePassword,
  getUsersList,
  getUserById,
  searchUser,
  deleteUserById,
  updateProfileStatus,
  deleteProfile,
  deleteProfileStatus,
  updateUserProfile,
  getWalletDetails
} = require("../../controller/user/userController");
const authentication = require("../../middleware/authentication");
const verifyUserEmail = require("../../middleware/verifyUserEmail");
const verifyAdmin = require("../../middleware/verifyAdmin");

router.get("/get-wallet",authentication, getWalletDetails)
/**
 * Route for user registration.
 * @name POST /api/user/register
 * @function
 * @param {Function} userRegister - Controller function to handle user registration process.
 */
router.post("/register", userRegister);

/**
 * Express route for user login.
 * Calls the loginUser controller function to handle the request.
 * @name POST /api/user/login
 * @function
 */
router.post("/login", loginUser);

/**
 * Express route for updating user profile image.
 * @name PATCH /api/user/update-profile-image
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path
 * @param {callback} middleware - Authentication middleware to verify user's access token
 * @param {callback} middleware - Controller function to handle updating profile image
 */
router.patch("/update-profile-image",authentication, updateProfileImage);

/**
 * Express route for updating user profile name.
 * @name PATCH /api/user/update-profile-name
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path
 * @param {callback} middleware - Authentication middleware to verify user's access token
 * @param {callback} middleware - Controller function to handle updating profile name
 */
router.patch("/update-profile-name", authentication, updateProfileName);

/**
 * Express route for updating user profile email.
 * @name PATCH /api/user/update-profile-email
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path
 * @param {callback} middleware - Authentication middleware to verify user's access token
 * @param {callback} middleware - Controller function to handle updating profile email
 */
router.patch("/update-profile-email", authentication, updateProfileEmail);

/**
 * Express route for updating user profile address.
 * @name PATCH /api/user/update-profile-address
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path
 * @param {callback} middleware - Authentication middleware to verify user's access token
 * @param {callback} middleware - Controller function to handle updating profile address
 */
router.patch("/update-profile-address", authentication, updateProfileAddress);

/**
 * Express route for updating user profile password.
 * @name PATCH /api/user/update-profile-password
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path
 * @param {callback} middleware - Authentication middleware to verify user's access token
 * @param {callback} middleware - Controller function to handle updating profile password
 */
router.patch("/update-profile-password", authentication, updateProfilePassword);

/**
 * Express route for verifying user email.
 * @name PATCH /api/user/verify-email
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path
 * @param {callback} middleware - Authentication middleware to verify user's access token
 * @param {callback} middleware - Controller function to handle email verification
 */
router.patch("/verify-email", authentication, verifyEmail);

/**
 * @URL : http://localhost:5050/api/user/update-profile-password
 */
// router.patch("/verify-phone-number", authentication, verifyPhoneNumber);

/**
 * Express route for initiating the forget password process.
 * @name POST /api/user/forget-password
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path
 * @param {callback} middleware - Controller function to handle forget password request
 */
router.put("/forget-password", forgetPassword);

/**
 * Express route for updating password after forget password process.
 * @name PATCH /api/user/forget-update-password
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path
 * @param {callback} middleware - Middleware to verify user email
 * @param {callback} middleware - Controller function to handle password update after forget password process
 */
router.patch("/forget-update-password", verifyUserEmail, forgetUpdatePassword);

router.delete("/delete-profile/:id",authentication, deleteProfile)

// ******* ADMIN APIs ******* //
/**
 * PATCH route to update the profile status of a user by their ID.
 * @param {string} "/update-profile-status/:id" - The endpoint URL, where ':id' is the ID of the user to update.
 * @param {Function} verifyAdmin - Middleware function to verify the admin's authorization.
 * @param {Function} updateProfileStatus - Controller function to handle the update of user profile status.
 */
router.patch("/update-profile-status/:id", verifyAdmin, updateProfileStatus);

/**
 * Express route to retrieve a paginated list of users.
 * @name GET /api/user/
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path
 * @param {callback} middleware - Middleware to verify admin authentication
 * @param {callback} middleware - Controller function to handle fetching the paginated list of users
 * @param {object} query - Query parameters for pagination (page, limit)
 */
router.get("/", verifyAdmin, getUsersList);

/**
 * Express route to search for users based on certain criteria.
 * @name GET /api/user/user-search
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path
 * @param {callback} middleware - Middleware to verify admin authentication
 * @param {callback} middleware - Controller function to handle user search
 * @query {string} searchKey - Search key to filter users
 * @query {number} page - Page number for pagination (optional)
 * @query {number} limit - Maximum number of users per page (optional)
 */
router.get("/user-search", verifyAdmin, searchUser);

/**
 * Express route to retrieve a user by ID.
 * @name GET /api/user/:id
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path with user ID as a parameter
 * @param {callback} middleware - Middleware to verify admin authentication
 * @param {callback} middleware - Controller function to handle fetching the user by ID
 */
router.get("/:id", verifyAdmin, getUserById);

/**
 * Express route to delete a user by ID.
 * @name DELETE /api/user/:id
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Express path
 * @param {callback} middleware - Middleware to verify admin authentication
 * @param {callback} middleware - Controller function to handle user deletion by ID
 * @param {string} id - User ID to delete
 */
router.put("/delete-profile-status/:id", verifyAdmin, deleteProfileStatus);

router.put("/update-profile", authentication, updateUserProfile);



module.exports = router;
