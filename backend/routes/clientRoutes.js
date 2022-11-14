/* const express = require("express");
const router = express.Router();
const {
  getClients,
  updateClientAccount,
  updateClientProfile,
  deleteClient,
  getOneClient,
  loginClient,
  registerClient,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/clientController");
const { protect } = require("../middleware/authMiddleware");
const { isResetTokenValid } = require("../utils/verifyPasswordToken");

router.route("/").get(protect, getClients);

router.route("/verify-token").get(isResetTokenValid, resetPassword);

router
  .route("/:id")
  .get(protect, getOneClient)
  .put(protect, updateClientAccount)
  .delete(protect, deleteClient);

router.route("/profile/:id").put(protect, updateClientProfile);

router.route("/register").post(registerClient);
router.route("/login").post(loginClient);
router.route("/verify").post(verifyEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(isResetTokenValid, resetPassword);

module.exports = router;
 */

const express = require("express");
const router = express.Router();
const {
  getClients,
  updateClientAccount,
  updateClientProfile,
  deleteClient,
  getOneClient,
  loginClient,
  registerClient,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/clientController");
const { protect } = require("../middleware/authMiddleware");
const { isResetTokenValid } = require("../utils/verifyPasswordToken");

router.route("/forgot-password").post(forgotPassword);
router.route("/").get(protect, getClients);

router.route("/verify-token").get(isResetTokenValid, resetPassword);

router
  .route("/:id")
  .get(protect, getOneClient)
  .put(protect, updateClientAccount)
  .delete(protect, deleteClient);

router.route("/profile/:id").put(protect, updateClientProfile);

router.route("/register").post(registerClient);
router.route("/login").post(loginClient);
router.route("/verify").post(verifyEmail);

router.route("/reset-password").post(isResetTokenValid, resetPassword);

module.exports = router;
