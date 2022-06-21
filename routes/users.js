const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");

const { authenticateToken } = require("../middleware/auth");
const {
  getAllUsers,
  userLogin,
  userSignUp,
  userForgotPassword,
  userResetPassword,
  addDealPosting,
  getAllDeals,
  addSubscriber,
  createPeopleProfile,
  getUserById,
  addFavourite,
  getMyFavourites,
  updateProfilePic,
  updatePeopleProfile
} = require("../controllers/users");

router.get("/", getAllUsers);
router.post("/login", userLogin);
router.post("/signup", userSignUp);
router.post("/forgot-password", userForgotPassword);
router.post("/reset-password", userResetPassword);
router.post("/add-subscriber", addSubscriber);
router.post("/deal-posting", authenticateToken, addDealPosting);
router.get("/deal-posting", getAllDeals);
router.put("/update-profile/:id", createPeopleProfile);
router.put("/update-profile-pic/:id", upload.single("image"), updateProfilePic);
router.get("/get-user/:id", getUserById);
router.post("/favourite", authenticateToken, addFavourite);
router.get("/favourite", authenticateToken, getMyFavourites);
router.post("/my-account/people/:id", updatePeopleProfile)

module.exports = router;
