const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { isResetTokenValid } = require("../utils/verifyPasswordToken");
const { addblog,
  get_all_blogs,
  add_comment,
  reply_comment,
  updateblog,
  get_freelancer_blogs,
  deleteblog

 } = require("../controllers/blog.controller");

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
  if (file.mimetype.split("/")[1] === "jpeg") {
    cb(null, true);
  } else {
    cb(new Error("Not a jpg File!!"), false);
  }
};

upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });
  

// add Blog
router.route("/add_blog").post(protect, upload.single('photo') ,addblog);


// update blog by by freelancer
router.route("/update_blog/:blog_id").patch(protect, upload.single('photo') ,updateblog);


// Only client can see all blogs
router.route("/get_all_blogs").get(protect, get_all_blogs);


// get all blogs for freelancer except its own blogs
router.route("/get_freelancer_blogs").get(protect, get_freelancer_blogs);


// Only client can comment on freelancer blog 
router.route("/comment/:blog_id").post(protect, add_comment);


// Only client can reply to comments on freelancer blog 
router.route("/replycomment/:blog_id/:comment_id").post(protect, reply_comment);

// delete blog with id // freelancer only
router.route("/deleteblog/:blog_id").delete(protect, deleteblog);


module.exports = router;
