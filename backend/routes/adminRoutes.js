const express = require("express");
const router = express.Router();
const {
    registerAdmin,
    loginAdmin,
    getFreelancers,
    getClients,
    getExchangeSkills,
    getProposal,
    deleteFreelancer,
    deleteClients,
    deleteExchangeSkills,
    getJobs,
    getGigs,
    getBlogs,
    deleteBlogs,
    deleteJobs,
    deleteGigs,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");



router.route('/register').post(registerAdmin)  //register api 

router.route('/login').post(loginAdmin)   //login  api

router.route('/freelancers').get(protect , getFreelancers)  //get freeelancers


router.route('/clients').get(protect , getClients)  // get clients

router.route('/ExchangeSkills').get(protect , getExchangeSkills)  // get Exchange Skills

router.route('/jobs').get(protect , getJobs)  // get jobs
router.route('/jobs').delete(protect , deleteJobs)  // get blogs

router.route('/gigs').get(protect , getGigs)  // get gigs
router.route('/gigs').delete(protect , deleteGigs)  // get blogs

router.route('/blogs').get(protect , getBlogs)  // get blogs

router.route('/blogs').delete(protect , deleteBlogs)  // delete blogs



router.route('/proposals').get(protect , getProposal)   // get propsoals one exchange skills

router.route('/freelancer').delete(protect , deleteFreelancer)     // delete freelancer

router.route('/clients').delete(protect , deleteClients)  

router.route('/ExchangeSkills').delete(protect , deleteExchangeSkills)  


module.exports = router;
