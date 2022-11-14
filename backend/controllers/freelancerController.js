const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ReportsFreelancer = require ( '../models/ReportsFreelancer' );
const asyncHandler = require("express-async-handler");
const Freelancer = require("../models/freelancerModel");
const exchangeSkills = require('../models/exchangeSkills')
const proposal = require('../models/proposalModel')
const OrderModel = require("../models/orderModel")
const { isValidObjectId, Promise } = require("mongoose");
const ResetPasswordToken = require("../models/resetPasswordToken");
const VerificationToken = require("../models/verificationTokenSchema");
const { createRandomBytes } = require("../utils/tokenGenreator");
const {
  mailTransport,
  generateOTP,
  generateEmailTemplate,
  generateForgotPasswordTemplate,
  generateResetPasswordComplete,
  generateverifySucceesfullyTemplate,
} = require("../utils/mail");
const { validate } = require("../models/freelancerModel");
const { promises } = require("nodemailer/lib/xoauth2");
const { response } = require("express");
const { saveNotifcation } = require('../utils/Notification')

const getFreelancers = asyncHandler(async (req, res) => {
  const freelancers = await Freelancer.find();
 return res.status(200).json(freelancers);
});

const getOneFreelancer = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findById(req.params.id);
  if (!freelancer) {
   return res.status(400);
    throw new Error("freelancer not found");
  }

 return res.status(200).json(freelancer);
});

// / Update Freelancer profile /

const updateFreelancerProfile = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findById(req.params.id);
  const {
    phoneNumber,
    gender,
    languages,
    address,
    Education,
    Category,
    Title,
    Description,
    Skills,
  } = req.body;

  if (
    !phoneNumber ||
    !gender ||
    !languages ||
    !address ||
    !Education ||
    !Category ||
    !Title ||
    !Description ||
    !Skills
  ) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (!req?.file?.mimetype)
    return res.status(400).json({ message: "select cover photo" });

  const photo = bufferConversion(req?.file?.originalname, req?.file?.buffer);

  const { secure_url } = await cloudinary(photo);

  if (!freelancer) {
    res.status(400);
    throw new Error("freelancer not found");
  }

  // Make sure the logged in freelancer matches the his id
  if (freelancer.id !== req.freelancer.id) {
    res.status(401);
    throw new Error("freelancer not authorized to update profile");
  }

  req.body.photo = secure_url;

  const updatedFreelancer = await Freelancer.findByIdAndUpdate(
    req.params.id,
    req.body,

    {
      new: true,
    }
  );

  res.status(200).json(updatedFreelancer);
});

// / update freelancer email password and username /

const updateFreelancerAccount = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findById(req.params.id);
  const { password, email } = req.body;

  if (!freelancer) {
    res.status(400);
    throw new Error("freelancer not found");
  }
  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401);
    throw new Error("freelancer requesting update not found");
  }

  // Make sure the logged in freelancer matches the his id
  if (freelancer.id !== req.freelancer.id) {
   res.status(401);
    throw new Error("freelancer not authorized to update account");
  }

  const freelancerExists = await Freelancer.findOne({ email });

  if (freelancerExists) {
   res.status(400).json({ errorMessage: "Email already exists" });
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;
  }

  const updatedFreelancer = await Freelancer.findByIdAndUpdate(
    req.params.id,
    req.body,

    {
      new: true,
    }
  );

  res.status(200).json(updatedFreelancer);
});

const deleteFreelancer = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findById(req.params.id);

  if (!freelancer) {
    res.status(400);
    throw new Error("freelancer not found");
  }

  if (freelancer.id !== req.freelancer.id) {
   return res.status(401);
    throw new Error("freelancer not authorized to delete");
  }

  await freelancer.remove();

  res.status(200).json({ id: req.params.id });
});

// auth work for freelancer

//REGISTER Freelancer

const registerFreelancer = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, verified } = req.body;

  if (!firstName || !lastName || !email || !password) {
   res.status(400);
    throw new Error("Please add all fields");
  }

  const freelancerExists = await Freelancer.findOne({ email });

  if (freelancerExists) {
   res.status(403).json({ errorMessage: "Freelancer already exists" });
  }

  // Create freelancer create ho jai fa
  const freelancer = await Freelancer.create({
    firstName,
    lastName,
    email,
    verified,
    password,
    profile: req.body,
  });
  const OTP = generateOTP();

  const verificationToken = await VerificationToken.create({
    owner: freelancer._id,
    token: OTP,
  });

  if (freelancer) {
     res.status(201).json({
      _id: freelancer.id,
      email: freelancer.email,
      token: generateToken(freelancer._id),
      OTP: await verificationToken.save(),
    });
    mailTransport().sendMail({
      from: "titfottat@email.com",
      to: freelancer.email,
      subject: "Verify your email account",
      html: generateEmailTemplate(OTP),
    });
  } else {
   res.status(400);
    throw new Error("Invalid freelancer data");
  }
});

const loginFreelancer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for freelancer email
  const freelancer = await Freelancer.findOne({ email });

  if (freelancer && (await bcrypt.compare(password, freelancer.password))) {
    res.json({
      _id: freelancer.id,
      email: freelancer.email,
      token: generateToken(freelancer._id),
    });
  } else {
    res.status(401).json({ errorMessage: "Invalid Freelancer Credentials" });
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { freelancerId, otp } = req.body;
  if (!freelancerId || !otp.trim())
    return res.json({ errorMessage: "Invalid request, missing parameters!" });

  if (!isValidObjectId(freelancerId))
    return res.json({ errorMessage: "Invalid freelancer id!" });

  const freelancer = await Freelancer.findById(freelancerId);
  if (!freelancer)
    return res.json({ errorMessage: "Sorry, freelancer not found!" });

  if (freelancer.verified)
    return res.json({ errorMessage: "This account is already verified!" });

  const token = await VerificationToken.findOne({ owner: freelancer._id });
  if (!token) res.json({ errorMessage: "Sorry, freelancer not found!" });

  const isMatched = await token.compareToken(otp);
  if (!isMatched)
    return res.json({ errorMessage: "Please provide a valid token!" });
  freelancer.verified = true;
  await VerificationToken.findByIdAndDelete(token._id);
  await freelancer.save();

  mailTransport().sendMail({
    from: "titfottat@email.com",
    to: freelancer.email,
    subject: "Verify your email account",
    html: generateverifySucceesfullyTemplate(
      `<h1>Your email have been verified successfully <h1/>`
    ),
  });

  res.json({
    success: true,
    message: "your email is verified. ",
    freelancer: {
      _id: freelancer.id,
      email: freelancer.email,
    },
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
   res.status(403).json({ errorMessage: "  Please Provide a valid Email" });
  }

  const freelancer = await Freelancer.findOne({ email });
  if (!freelancer) {
   res.status(403).json({ errorMessage: "  User not found invalid Request" });
  }

  const token = await ResetPasswordToken.findOne({
    owner: freelancer._id,
  });
  if (token) {
    res
      .status(403)
      .json({ errorMessage: "Only after one hour you can request new token" });
  }

  const randomBytes = await createRandomBytes();

  const resetPasswordToken = await ResetPasswordToken.create({
    owner: freelancer._id,
    token: randomBytes,
  });

  await resetPasswordToken.save();

  mailTransport().sendMail({
    from: "security@titfottat.com",
    to: freelancer.email,
    subject: "Password Reset",
    html: generateForgotPasswordTemplate(
      `<h1><a href="http://localhost:3000/reset-password-freelancer?token=${randomBytes}&id=${freelancer._id}">Visit TitForTat!</a><h1/>`
    ),
  });

  res.json({
    success: true,
    successMessage: "Password reset link is sent to your email. ",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const freelancer = await Freelancer.findById(req.freelancer._id);
  if (!freelancer) {
    res.status(403).json({
      errorMessage: "freelancer not found! ",
    });
  }
  const isSamePassword = await freelancer.comparePassword(password);

  if (isSamePassword) {
    res.status(403).json({
      errorMessage: "New password must be the different!",
    });
  }
  if (password.trim().length < 8 || password.trim().length > 20) {
   res.status(403).json({
      errorMessage: "Password must be 8 to 20 characters long! ",
    });
  }

  freelancer.password = password.trim();
  await freelancer.save();

  await ResetPasswordToken.findOneAndDelete({ owner: freelancer._id });

  mailTransport().sendMail({
    from: "security@titfottat.com",
    to: freelancer.email,
    subject: "Password Reset Completed",
    html: generateResetPasswordComplete(
      `<!h1>Your Password was successfully reset</h1>`
    ),
  });

  res.json({
    success: true,
    successMessage: "Password is successfully reset. ",
  });
});

// Generate JWT
const generateToken = (id) => {
  
  return jwt.sign({ id, type: "freelancer" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};


// Exchange skills Module 
// Add/Post Exchange skills controller 

const addExchangeSkills = asyncHandler(async (req, res) => {

  const { title, discription, duration, offeredSkills, requiredSkills, price, tags } = req.body;

  if (!title || !discription || !duration || !offeredSkills || !requiredSkills || !price || !tags) {
   return res.status(400).json({ errorMessage: "Please fill all the  field" });
  }

  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
  }

  const id = req.freelancer._id;

  const freelancerExists =   await Freelancer.findOne({ _id :id });


  if (!freelancerExists) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  // add exchangeSkills  to database 
  const response = await exchangeSkills.create({
    freelancer: id,
    title,
    discription,
    duration,
    offeredSkills,
    requiredSkills,
    price,
    tags
  });

  if (response) {
    await saveNotifcation(id , id , response._id , 'Exchange Skills Successfully Added ' ,  title)


    let previousblogs = await ReportsFreelancer.find( { freelancer: id } )
    let count = previousblogs[0]?.TotalExchangeSkills || 0;
      let filter = { freelancer: id }
      let update = { TotalExchangeSkills: count + 1 }
     await ReportsFreelancer.findOneAndUpdate(filter, update, { upsert: true, new : true } );

   return res.status(201).json({
      _id: response._id,
      freelancer: response.freelancer,
      title: response.title,
      discription: response.discription,
      duration: response.duration,
      offeredSkills: response.offeredSkills,
      requiredSkills: response.requiredSkills,
      price: response.price,
      tags: response.tags
    });
  } else {
   return res.status(400).json({ errorMessage: "Error While  Adding Exchange Skills Data" });
  }
});

// get/fetch Exchange skills controller 

const getAllExchangeSkills = asyncHandler(async (req, res) => {

  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
  }
  const id = req.freelancer._id;
  const freelancerExists =   await Freelancer.findOne({ _id :id });

  if (!freelancerExists) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  let response = await exchangeSkills.find({ freelancer: { $ne: id } }).populate("freelancer");

 return res.status(200).json(response)
})


// get/fetch one Exchange skills controller 

const getExchangeSkill = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
  }
  const id = req.freelancer._id;
  const freelancerExists =   await Freelancer.findOne({ _id :id });

  if (!freelancerExists) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  let result = await exchangeSkills.findOne({ _id: _id }).populate("freelancer");

  if(!result){
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  let totalProposals = await proposal.find({ exchangeSkillsId : result._id })
  let totalProposalsCount = totalProposals.length;
 
  let response = {
    exchangeSkills : result,
    totalProposals : totalProposals,
    totalProposalsCount : totalProposalsCount 
  }

 return res.status(200).json(response)
})

// update/patch Exchange skills controller 
const updateExchangeSkills = asyncHandler(async (req, res) => {

  const { _id, title, discription, duration, offeredSkills, requiredSkills, price, tags } = req.body;
  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
  }

  const id = req.freelancer._id;

  const freelancerExists =   await Freelancer.findOne({ _id :id });

  if (!freelancerExists) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  let doc = await exchangeSkills.findOne({ _id: _id });

  if (!doc) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  doc = await exchangeSkills.findOne({ _id, freelancer: id });
  if (!doc) {
   return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
  }

  const filtr = { _id: _id }
  let update = {
    title,
    discription,
    duration,
    offeredSkills,
    requiredSkills,
    price,
    tags
  }

  let result = await exchangeSkills.findOneAndUpdate(filtr, update);
  await saveNotifcation(id , id , result._id , 'Exchange Skills Successfully Updated ' ,  result.title)
  await result.save();

  const response = await exchangeSkills.findOne({ _id: _id })
 return res.status(200).json(response)

});

//  add proposal 

const submitProposal = asyncHandler(async (req, res) => {

  const { exchangeSkillsId, bid, duration, coverLetter, recentExperience, socialMediaLinks } = req.body;

  const attachment = req.file.path;

  if (!bid || !duration || !coverLetter || !recentExperience || !socialMediaLinks || !attachment || !exchangeSkillsId) {
   return res.status(400).json({ errorMessage: "Please fill all the  field" });
  }

  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Route" });
  }
  const id = req.freelancer._id;

  const freelancerExists =   await Freelancer.findOne({ _id :id });

  if (!freelancerExists) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  const freelancer = await exchangeSkills.findOne({ _id : exchangeSkillsId });


  // add exchangeSkills  to database 
  const response = await proposal.create({
    submittedBy: id,
    freelancer : freelancer.freelancer,
    exchangeSkillsId,
    bid,
    duration,
    coverLetter,
    recentExperience,
    socialMediaLinks,
    attachment
  });

  if (response) {
    await saveNotifcation(id , freelancer.freelancer , response._id , 'Proposal has added On your Exchange Skills ' , coverLetter)
   return res.status(201).json({
      _id: response._id,
      submittedBy: response.submittedBy,
      freelancer : response.freelancer,
      Bid: response.bid,
      duration: response.duration,
      coverLetter: response.coverLetter,
      requiredSkills: response.requiredSkills,
      recentExperience: response.recentExperience,
      socialMediaLinks: response.socialMediaLinks,
      attachment: response.attachment,
      status: response.status,
      updated:response.updated
    });
  } else {
   return res.status(400).json({ errorMessage: "Error While  Adding Exchange Skills Data" });
  }
});

// update proposal

const updateProposal = asyncHandler(async (req, res) => {

  const {  bid, duration, coverLetter, recentExperience, socialMediaLinks } = req.body;
  const attachment = req.file.path;
  const updated = 1
  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Route" });
  }
  const id = req.freelancer._id;
  const { _id } = req.body;
  let doc =   await Freelancer.findOne({ _id :id });

  if (!doc) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  doc = await proposal.findOne({ _id, submittedBy: id });
  console.log(doc)
  if (!doc || doc.updated == 1) {
   return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
  }

  const filter = { _id: _id, submittedBy: id }
  // update proposal 
  let update = {
    bid,
    duration,
    coverLetter,
    recentExperience,
    socialMediaLinks,
    attachment,
    updated
  }

  let result = await proposal.findOneAndUpdate(filter, update);
  await result.save();

  const response = await proposal.findOne({ _id: _id })
  const freelancer = await exchangeSkills.findOne({ _id : doc.exchangeSkillsId });
  if (response) {
    await saveNotifcation(id ,freelancer.freelancer , _id , 'Proposal has Updated On your Exchange Skills ' , coverLetter)
   return res.status(201).json({
      _id: response._id,
      submittedBy: response.submittedBy,
      Bid: response.bid,
      duration: response.duration,
      coverLetter: response.coverLetter,
      requiredSkills: response.requiredSkills,
      recentExperience: response.recentExperience,
      socialMediaLinks: response.socialMediaLinks,
      attachment: response.attachment,
      status: response.status,
      updated: response.updated
    });
  } else {
   return res.status(400).json({ errorMessage: "Error While  Adding Exchange Skills Data" });
  }
});

// get proposals to show freelancer 1 who posted exchange skills list

const getProposals = asyncHandler(async (req, res) => {

  const { _id } = req.body;
  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
  }
  const id = req.freelancer._id;
  const freelancerExists =   await Freelancer.findOne({ _id :id });

  if (!freelancerExists) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  let response = await proposal.find({ exchangeSkillsId: _id , freelancer :id}).populate("exchangeSkillsId");

  if(!response){
   return res.status(404).json({errorMessage : "No Record Found"})
  }

 return res.status(200).json({response , proposalCount : response.length })
});


// get one  proposal to show freelancer 1 and freelancer 2 

const getOneProposal = asyncHandler(async (req, res) => {

  const { _id } = req.body;
  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
  }
  const id = req.freelancer._id;
  const freelancerExists =   await Freelancer.findOne({ _id :id });

  if (!freelancerExists) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  let response = await proposal.findOne({ _id: _id ,  $or: [{ freelancer: id }, { submittedBy: id }] } ).populate("exchangeSkillsId").populate("freelancer").populate("submittedBy");
 
  if(!response){
   return res.status(404).json({errorMessage : "No Record Found"})
  }

 return res.status(200).json(response)
});


// get proposal to show freelancer 2 who posted exchange skills list

const getProposalsForFreelancer2 = asyncHandler(async (req, res) => {

  const { _id } = req.body;
  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
  }
  const id = req.freelancer._id;
  const freelancerExists =   await Freelancer.findOne({ _id :id });

  if (!freelancerExists) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }
  console.log(id)

  let response = await proposal.find({ exchangeSkillsId: _id , submittedBy : id }).populate("exchangeSkillsId")

  if(!response){
   return res.status(404).json({errorMessage : "No Record Found"})
  }

 return res.status(200).json({response , proposalCount : response.length })
});

// get exchange skills list which is posted by freelancer and this will show to him  who  poasted his skillsRequest

const exchangeSkillsList = asyncHandler(async (req, res) => {
  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
  }
  const id = req.freelancer._id;
  const freelancerExists =   await Freelancer.findOne({ _id :id });

  if (!freelancerExists) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  let response = await exchangeSkills.find({ freelancer: id });
 return res.status(200).json(response)
});


// accept proposal

const acceptProposals = asyncHandler(async (req, res) => {
  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
  }
  const id = req.freelancer._id;
  const { _id } = req.body;

  let doc =   await Freelancer.findOne({ _id :id });

  if (!doc) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  doc = await proposal.findOne({ _id, freelancer: id});
  
  if (!doc || doc.status == -1) {
   return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
  }

  const authorized = await proposal.findOne({ _id }).populate('exchangeSkillsId');   // check whom posted this exchange skills request and then check if match then can accept because freelancer who posted can only accrpt

  // if (authorized.exchangeSkillsId.freelancer !== id) {
  //   console.log('bye')
  //  return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
  // }

  let filter = { _id: _id };
  let update = {
    status: 1
  }

  let result = await proposal.findOneAndUpdate(filter, update)
  await saveNotifcation(id ,result.submittedBy ,  _id , 'Your Proposal has accepted ' , result.coverLetter)
  await result.save()
  const response = await proposal.findOne({ _id });

  const order = await OrderModel.create({
    proposalId: _id,
    submittedBy: response.submittedBy,
    freelancer: _id,
    type : 'ExchangeSkills'
  });

  if(order)return res.status(200).json(order)
  
});

// reject proposal

const rejectProposals = asyncHandler(async (req, res) => {
  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
  }
  const id = req.freelancer._id;
  const { _id } = req.body;

  let doc =   await Freelancer.findOne({ _id :id });

  if (!doc) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  doc = await proposal.findOne({ _id, freelancer: id });
  if (!doc || doc.status == -1 ||  doc.status == 1) {
   return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
  }

  const authorized = await proposal.findOne({ _id }).populate('exchangeSkillsId');   // check whom posted this exchange skills request and then check if match then can accept because freelancer who posted can only accrpt

  // if (authorized.exchangeSkillsId.freelancer != id) {
  //  return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
  // }

  let filter = { _id: _id };
  let update = {
    status: -1
  }

  let result = await proposal.findOneAndUpdate(filter, update)
  await saveNotifcation(id , result.submittedBy ,  _id , 'Your Proposal has Rejected ' , result.coverLetter)
  await result.save()
  const response = await proposal.findOne({ _id });

if(response) {res.status(200).json(response)}
 
});


// contourProposals proposal

const contourProposals = asyncHandler(async (req, res) => {
  // Check for freelancer
  if (!req.freelancer) {
   return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
  }
  const id = req.freelancer._id;
  const { _id ,comment} = req.body;

  let doc =   await Freelancer.findOne({ _id :id });

  if (!doc) {
   return res.status(403).json({ errorMessage: "Unauthorized" });
  }

  doc = await proposal.findOne({ _id, freelancer: id });

  if (!doc || doc.status == -1 ||  doc.status == 1 || doc.updated == 1) {
   return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
  }

  const authorized = await proposal.findOne({ _id }).populate('exchangeSkillsId');   // check whom posted this exchange skills request and then check if match then can accept because freelancer who posted can only accrpt

  // if (authorized.exchangeSkillsId.freelancer != id) {
  //  return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
  // }

  let filter = { _id: _id };
  let update = {
    updated: 1,
    comment
  }

  let result = await proposal.findOneAndUpdate(filter, update)
  await saveNotifcation(id , result.submittedBy ,  _id , 'User Commented On your Proposal ' , result.coverLetter)
  await result.save()
  const response = await proposal.findOne({ _id });

if(response) {res.status(200).json(response)}
 
});


module.exports = {
  getFreelancers,
  updateFreelancerAccount,
  updateFreelancerProfile,
  deleteFreelancer,
  getOneFreelancer,
  registerFreelancer,
  loginFreelancer,
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
  getOneProposal
};
