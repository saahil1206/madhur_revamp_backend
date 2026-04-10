const express = require("express");
const controller = require("./controller");

const router = express.Router();

router.get("/", controller.list);
router.get("/requests", controller.listRequests);
router.post("/generate", controller.generate);

module.exports = router;
