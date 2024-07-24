const router = require("express").Router();
const authentication = require("../../middleware/authentication")
const verifyAdmin = require("../../middleware/verifyAdmin");
const {createEnquire, getAllEnquires, getEnquire, updateEnquire} = require("../../controller/enquire/enquireController")

router.post("/create", authentication, createEnquire)
router.get("/", verifyAdmin, getAllEnquires);
router.get("/:id", verifyAdmin, getEnquire);
router.put("/update/:id", verifyAdmin, updateEnquire)
module.exports = router;