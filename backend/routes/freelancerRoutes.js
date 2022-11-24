const express = require("express");
const router = express.Router();
const {
  getFreelancers,
  updateFreelancerAccount,
  updateFreelancerProfile,
  deleteFreelancer,
  getOneFreelancer,
  loginFreelancer,
  registerFreelancer,
  verifyEmail,
  forgotPassword,
  resetPassword,
  addExchangeSkills,
  getAllExchangeSkills,
  updateExchangeSkills,
  getExchangeSkill,
  submitProposal,
  getProposals,
  exchangeSkillsList,
  updateProposal,
  acceptProposals,
  rejectProposals,
  contourProposals,
  getProposalsForFreelancer2,
  getOneProposal,
} = require("../controllers/freelancerController");
const { protect } = require("../middleware/authMiddleware");
const proposal = require("../models/proposalModel");
const { isResetTokenValid } = require("../utils/verifyPasswordTokenFreelancer");
const multer  = require('multer')
let upload = multer({ dest: 'uploads/' })


//Configuration for Multer
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `/${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "pdf") {
    cb(null, true);
  } else {
    cb(new Error("Not a PDF File!!"), false);
  }
};

 upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});




// Exchange skills apis  start

router.route
('/ExchangeSkills')
.post(protect,addExchangeSkills)   //add Exchange skill
.get(protect,getAllExchangeSkills)  // get all Exchage skills  list
.patch(protect,updateExchangeSkills)  // // update Exchage skill


// get exchange skills list which is posted by fiver and this will show for whom it poasted 
router.route('/exchangeSkillsList').get(protect , exchangeSkillsList)

// get one exchane skills  deatils of 
router.route("/ExchangeSkills/Details").get(protect , getExchangeSkill)

// send proposal 
router.route('/proposal')
.post(protect , upload.single('attachment') , submitProposal)    //submit proposal 
.get(protect , getProposals)                    //  get proposal for freelancer  2  who submit proposal
.patch(protect , upload.single('attachment') ,updateProposal)     //update proposal

//  get proposals for freelancer  2  who submit proposal
router.route('/proposals').get(protect, getProposalsForFreelancer2)   

//  get onee proposals for freelancer  2 and freelancer 1 
router.route('/proposal/Detail').get(protect,getOneProposal)   


// accept proposal
router.route("/proposal/accept").patch(protect , acceptProposals)

// reject proposal
router.route("/proposal/reject").patch(protect , rejectProposals)

// contour proposal
router.route("/proposal/contour").patch(protect , contourProposals)

// Exchange skills apis  end


router.route("/forgot-password").post(forgotPassword);

router.route("/").get(protect, getFreelancers);
router.route("/verify-token").get(isResetTokenValid, resetPassword);

router
  .route("/:id")
  .get( protect, getOneFreelancer)
  .put(protect, updateFreelancerAccount)
  .delete(protect, deleteFreelancer);

router.route("/profile/:id").put(protect, updateFreelancerProfile);

router.route("/register").post(registerFreelancer);

router.route("/login").post(loginFreelancer);

router.route("/verify").post(verifyEmail);

router.route("/reset-password").post(isResetTokenValid, resetPassword);




module.exports = router;
