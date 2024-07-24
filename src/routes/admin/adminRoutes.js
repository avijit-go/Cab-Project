/** @format */

const {
    adminRegister,
    adminLogin,
    forgetPassword,
    verifyEmailOTP,
    forgetUpdatePassword,
    getAdminProfile,
    updateProfileImage,
    getAdminList,
    updateAdminProfile,
    updatePassword,
    searchAdmin,
  } = require("../../controller/admin/adminController");
  const router = require("express").Router();
  const verifyUserEmail = require("../../middleware/verifyUserEmail");
  const verifyAdmin = require("../../middleware/verifyAdmin");
  
  /**
   * Express route to register a new admin.
   * @name POST /api/admin/register
   * @function
   * @memberof module:routes/adminRoutes
   * @param {string} path - Express path
   * @param {callback} middleware - Controller function to handle admin registration
   * @param {object} req.body - Request body containing admin registration data
   * @param {string} req.body.name - Admin's name
   * @param {string} req.body.email - Admin's email address
   * @param {string} req.body.password - Admin's password
   * @param {string} req.body.confirmPassword - Confirmation of admin's password
   */
  router.post("/register", adminRegister);
  
  /**
   * Express route to authenticate an admin.
   * @name POST /api/admin/login
   * @function
   * @memberof module:routes/adminRoutes
   * @param {string} path - Express path
   * @param {callback} middleware - Controller function to handle admin authentication
   * @param {object} req.body - Request body containing admin login credentials
   * @param {string} req.body.email - Admin's email address
   * @param {string} req.body.password - Admin's password
   */
  router.post("/login", adminLogin);
  
  /**
   * Express route to initiate the password reset process for an admin.
   * @name POST /api/admin/forget-password
   * @function
   * @memberof module:routes/adminRoutes
   * @param {string} path - Express path
   * @param {callback} middleware - Controller function to handle password reset initiation
   * @param {object} req.body - Request body containing the admin's email address
   * @param {string} req.body.email - Admin's email address for password reset
   */
  router.post("/forget-password", forgetPassword); // *** This should be changed *** //
  
  // verify admin's email OTP
  // update admin details
  // search admins
  // upload amin's profile image
  // delete admin's account
  router.post("/verify-email-otp", verifyEmailOTP);
  
  /**
   * Express route to update the password of an admin after verification.
   * @name PATCH /api/admin/forget-update-password
   * @function
   * @memberof module:routes/adminRoutes
   * @param {string} path - Express path
   * @param {callback} middleware - Middleware function to verify the admin's email
   * @param {callback} middleware - Controller function to update the admin's password
   * @param {object} req.body - Request body containing the new password and confirm password
   * @param {string} req.body.password - New password for the admin account
   * @param {string} req.body.confirmPassword - Confirmation of the new password
   */
  router.patch("/forget-update-password", verifyUserEmail, forgetUpdatePassword);
  
  /**
   * Express route to retrieve the profile of an admin.
   * @name GET /api/admin/profile/:id
   * @function
   * @memberof module:routes/adminRoutes
   * @param {string} path - Express path
   * @param {callback} middleware - Middleware function to verify the admin's authentication
   * @param {callback} middleware - Controller function to get the admin's profile
   * @param {object} req.params - Request parameters containing the admin's ID
   * @param {string} req.params.id - The ID of the admin whose profile is being retrieved
   */
  router.get("/profile/:id", verifyAdmin, getAdminProfile);
  
  /**
   * Express route to update the profile image of an admin.
   * @name PUT /api/admin/profile-image/:id
   * @function
   * @memberof module:routes/adminRoutes
   * @param {string} path - Express path
   * @param {callback} middleware - Middleware function to verify the admin's authentication
   * @param {callback} middleware - Controller function to update the admin's profile image
   * @param {object} req.params - Request parameters containing the admin's ID
   * @param {string} req.params.id - The ID of the admin whose profile image is being updated
   * @param {object} req.body - Request body containing the new profile image data
   * @param {string} req.body.image - Base64 encoded image data representing the new profile image
   */
  router.patch("/profile-image/:id", verifyAdmin, updateProfileImage);
  
  /**
   * Express route to retrieve the list of admin users.
   * @name GET /api/admin/list
   * @function
   * @memberof module:routes/adminRoutes
   * @param {string} path - Express path
   * @param {callback} middleware - Middleware function to verify the admin's authentication
   * @param {callback} middleware - Controller function to get the list of admin users
   */
  router.get("/list", verifyAdmin, getAdminList);
  
  /**
   * Express route to update the profile of an admin.
   * @name PATCH /api/admin/update-profile/:id
   * @function
   * @memberof module:routes/adminRoutes
   * @param {string} path - Express path
   * @param {callback} middleware - Middleware function to verify the admin's authentication
   * @param {callback} middleware - Controller function to update the admin's profile
   * @param {object} req.params - Request parameters containing the admin's ID
   * @param {string} req.params.id - The ID of the admin whose profile is being updated
   * @param {object} req.body - Request body containing the updated profile data
   * @param {string} req.body.Name - New name for the admin
   * @param {string} req.body.email - New email for the admin
   */
  router.patch("/update-profile/:id", verifyAdmin, updateAdminProfile);
  
  /**
   * Express route to update the password of an admin.
   * @name PUT /api/admin/update-password/:id
   * @function
   * @memberof module:routes/adminRoutes
   * @param {string} path - Express path
   * @param {callback} middleware - Middleware function to verify the admin's authentication
   * @param {callback} middleware - Controller function to update the admin's password
   * @param {object} req.params - Request parameters containing the admin's ID
   * @param {string} req.params.id - The ID of the admin whose password is being updated
   * @param {object} req.body - Request body containing the new password
   * @param {string} req.body.password - New password for the admin account
   */
  router.put("/update-password/:id", verifyAdmin, updatePassword);
  
  /**
   * Express route to search for admin users.
   * @name GET /api/admin/search-admin
   * @function
   * @memberof module:routes/adminRoutes
   * @param {string} path - Express path
   * @param {callback} middleware - Middleware function to verify the admin's authentication
   * @param {callback} middleware - Controller function to search for admin users
   * @param {object} req.query - Request query parameters for search criteria
   * @param {string} req.query.keyword - Keyword to search for admin users
   */
  router.get("/search-admin", verifyAdmin, searchAdmin);
  module.exports = router;
  