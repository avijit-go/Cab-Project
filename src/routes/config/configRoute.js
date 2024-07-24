const router = require("express").Router();
const verfifyAdmin = require("../../middleware/verifyAdmin");
const { createConfig,updateConfig, getConfigData } = require("../../controller/config/configController")

router.post("/", verfifyAdmin, createConfig);
router.get("/", verfifyAdmin, getConfigData);
router.put("/update/:id", verfifyAdmin, updateConfig);

module.exports = router;