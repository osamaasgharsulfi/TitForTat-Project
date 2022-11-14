const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { isResetTokenValid } = require("../utils/verifyPasswordToken");
const { 
    read_notification
 } = require("../controllers/notificationsController");

  

// read notifications
router.route("/notification").get(protect, read_notification);



module.exports = router;