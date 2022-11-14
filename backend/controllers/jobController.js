const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
//models
const Admin = require('../models/adminModel')
const Client = require('../models/clientModel')
const Freelancer = require('../models/freelancerModel')
const ExchangeSkills = require('../models/exchangeSkills');
const proposalModel = require('../models/proposalModel');
const exchangeSkills = require('../models/exchangeSkills');
const OrderModel = require('../models/orderModel')
const jobModel = require('../models/jobModel');
const jobProposal = require('../models/jobProposal');
const paymentModel = require('../models/payment')
const {createCharges} = require('../utils/charges')
const { saveNotifcation } = require('../utils/Notification')
const ReportsClient = require ( '../models/ReportsClient' )

// add job

const addJob = asyncHandler(async (req, res) => {

    const { title, discription, country, duration, budget, skills, experienceLevel, category } = req.body;

    if (!title || !discription || !country || !duration || !budget || !skills || !experienceLevel || !category) {
        return res.status(400).json({ errorMessage: "Please fill all the  field" });
    }

    // Check for client
    if (!req.client) {
        return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
    }
    const { id } = req.client

    const client = await Client.findOne({ _id :id });

    if (!client) {
        return res.status(403).json({ errorMessage: "Unauthorized" });
    }

    // add exchangeSkills  to database 
    const response = await jobModel.create({
        client: id,
        title,
        discription,
        country,
        duration,
        budget,
        skills,
        experienceLevel,
        category
    });

    if (response) {
      await saveNotifcation(id , id , response._id , 'job Successfully Added ' ,  title)
      let previousjobs = await ReportsClient.find( { client: id } )

      let count = previousjobs[0]?.TotalJobs || 0;
      let filter = { client : id }
      let update = { TotalJobs: count + 1 }
     await ReportsClient.findOneAndUpdate(filter, update, { upsert: true, new : true } );
    return res.status(201).json({ response });
    } else {
        return res.status(400).json({ errorMessage: "Error While  Adding Job Data" });
    }
});


 /// get all jobs
 const getAllJobs = asyncHandler(async (req, res) => {
  
    let response = await jobModel.find({ }).populate("client")
  
    if(!response){
   return  res.status(404).json({errorMessage : "No Record Found"})
    }
  
  return res.status(200).json({response})
  });

   /// get all jobs
 const   getOneJob = asyncHandler(async (req, res) => {
  const {_id } =req.params;
  console.log(_id)
    let response = await jobModel.find({_id :_id }).populate("client")
    let proposals = await proposalModel.find({ job :_id});
    if(!response){
   return  res.status(404).json({errorMessage : "No Record Found"})
    }
  
  return res.status(200).json({response , proposalCount : proposals.length })
  });

// update/patch  job controller 
const updateJob = asyncHandler(async (req, res) => {
    const _id = req.params._id;

    const { title, discription, country, duration, budget, skills, experienceLevel, category } = req.body;

    if (!title || !discription || !country || !duration || !budget || !skills || !experienceLevel || !category) {
        return res.status(400).json({ errorMessage: "Please fill all the  field" });
    }

    // Check for client
    if (!req.client) {
        return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
    }
    const { id } = req.client

    const client = await Client.findOne({ _id:id });

    if (!client) {
        return res.status(403).json({ errorMessage: "Unauthorized" });
    }

    let doc = await jobModel.findOne({ _id: _id });

    if (!doc) {
        return res.status(403).json({ errorMessage: "Unauthorized" });
    }

    doc = await jobModel.findOne({ _id, client: id });
    if (!doc) {
        return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
    }

    const filtr = { _id: _id }
    let update = {
        title,
        discription,
        country,
        duration,
        budget,
        skills,
        experienceLevel,
        category
    }

    let result = await jobModel.findOneAndUpdate(filtr, update);
    if(result){
      await saveNotifcation(id , id , result._id , 'job Successfully Updated ' ,  result.title)
      await result.save();

      const response = await jobModel.findOne({ _id: _id })
  
      return res.status(200).json(response)
    }

});

//   delete  ExchangeSkills 
const deletejob = asyncHandler(async (req, res) => {
    const  _id  = req.params._id
    // Check for admin
    if (!req.client) {
         return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
    }

    const { id } = req.client
    const client = await Client.findOne({_id :id });

    if (!client) {
        return res.status(403).json({ errorMessage: "Unauthorized" });
    }

    let jobmodel = await jobModel.findOne({ _id: _id , client : id})

    if (jobmodel) {
        let result = await jobModel.deleteOne({ _id: _id })
        await saveNotifcation(id , id , _id , 'Job Successfully Deleted ' ,  jobmodel.title)

        if (result.deletedCount == 1) {
            let response = await jobProposal.deleteMany({ job: _id })
            
            if (response.deletedCount) {
                return res.status(200).json(`Jobs And ${response.deletedCount} Submitted Proposals On Jobs  Successfully Deleted`)
            }
            else {
                return res.status(200).json(`Jobs And 0 Submitted Proposals On Jobs  Successfully Deleted`)
            }
        }
        else {
            return res.status(400).json({ errorMessage: "Error Occured" });
        }
    } else {
        return res.status(403).json({ errorMessage: "Unauthorized" });
    }
})


//submit proposal 
const submitProposal = asyncHandler(async (req, res) => {

    const { job, bid, duration, coverLetter, recentExperience, socialMediaLinks } = req.body;

    const attachment = req.file.path;

    if (!bid || !duration || !coverLetter || !recentExperience || !socialMediaLinks || !attachment || !job) {
        return res.status(400).json({ errorMessage: "Please fill all the  field" });
    }

    // Check for freelancer
    if (!req.freelancer) {
        return res.status(401).json({ errorMessage: "User Cannot access this Route" });
    }
    const { id } = req.freelancer

    const freelancerExists = await Freelancer.findOne({ _id: id });

    if (!freelancerExists) {
        return res.status(403).json({ errorMessage: "Unauthorized" });
    }

    const Job = await jobModel.findOne({ _id: job });
    if (Job) {   
    // add job proposal  to database 
        const response = await jobProposal.create({
            submittedBy: id,
            client: Job.client,
            job,
            bid,
            duration,
            coverLetter,
            recentExperience,
            socialMediaLinks,
            attachment
        });

        if (response) {
          await saveNotifcation(id , Job.client , response._id , 'Proposal has added On Job ' ,  response.coverLetter)

            res.status(201).json({
                _id: response._id,
                submittedBy: response.submittedBy,
                Client: response.client,
                job: response.job,
                Bid: response.bid,
                duration: response.duration,
                coverLetter: response.coverLetter,
                recentExperience: response.recentExperience,
                socialMediaLinks: response.socialMediaLinks,
                attachment: response.attachment,
                status: response.status,
                updated: response.updated
            });
        } else {
            return res.status(400).json({ errorMessage: "Error While  Adding Exchange Skills Data" });
        }
    }

});
  
// update proposal

const updateProposals = asyncHandler(async (req, res) => {

    const { bid, duration, coverLetter, recentExperience, socialMediaLinks } = req.body;
    const attachment = req.file.path;
    const updated = 1
    // Check for freelancer
    if (!req.freelancer) {
      return res.status(401).json({ errorMessage: "User Cannot access this Route" });
    }
    const { id } = req.freelancer
    const  _id  = req.params._id;
   
    let doc = await Freelancer.findOne({ _id : id });
  
    if (!doc) {
     return  res.status(403).json({ errorMessage: "Unauthorized" });
    }
  
    doc = await jobProposal.findOne({ _id, submittedBy: id });
   
    if (!doc) {
      res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
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
  
    let result = await jobProposal.findOneAndUpdate(filter, update);
    await result.save();
  
    const response = await jobProposal.findOne({ _id: _id })
  
    if (response) {

      await saveNotifcation(id , response.client, _id ,'Proposal has Updated By freelancer' , response.coverLetters)

      res.status(201).json({
        _id: response._id,
        submittedBy: response.submittedBy,
        Bid: response.bid,
        duration: response.duration,
        coverLetter: response.coverLetter,
        recentExperience: response.recentExperience,
        socialMediaLinks: response.socialMediaLinks,
        attachment: response.attachment,
        status: response.status,
        updated: response.updated
      });
    } else {
      res.status(400).json({ errorMessage: "Error While  Adding Exchange Skills Data" });
    }
  });
  

//getJobProposalsForFreelancer

const getJobProposalsForFreelancer = asyncHandler(async (req, res) => {

    // Check for freelancer
    if (!req.freelancer) {
     return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
    }
    const { id } = req.freelancer
    const {_id} =req.params;
    console.log(_id)
    const freelancerExists = await Freelancer.findOne({ _id : id });
  
    if (!freelancerExists) {
    return   res.status(403).json({ errorMessage: "Unauthorized" });
    }
  
    let response = await jobProposal.find({  job : _id ,submittedBy : id }).populate("job").populate("client")
  
    if(!response){
   return  res.status(404).json({errorMessage : "No Record Found"})
    }
  
  return res.status(200).json({response , proposalCount : response.length })
  });


 /// getJobProposals for client
 const getJobProposalsForClient = asyncHandler(async (req, res) => {

    // Check for client
    if (!req.client) {
     return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
    }
    const { id } = req.client
    const {_id} =req.params;
  
    const clinetExist = await Client.findOne({ _id : id });
  
    if (!clinetExist) {
    return   res.status(403).json({ errorMessage: "Unauthorized" });
    }
  
    let response = await jobProposal.find({  job : _id ,client : id }).populate("job").populate("submittedBy")
  
    if(!response){
   return  res.status(404).json({errorMessage : "No Record Found"})
    }
  
  return res.status(200).json({response , proposalCount : response.length })
  });


   /// getJob for client
 const getJobForFreelancer = asyncHandler(async (req, res) => {

    // Check for freelancer
    if (!req.freelancer) {
     return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
    }
    const { id } = req.freelancer
  
    const freelancerExist = await Freelancer.findOne({ _id : id });
  
    if (!freelancerExist) {
    return   res.status(403).json({ errorMessage: "Unauthorized" });
    }
    let response = await jobProposal.find({ submittedBy : id }).populate("job")
  
    if(!response){
   return  res.status(404).json({errorMessage : "No Record Found"})
    }
  
  return res.status(200).json({response , JobCount : response.length })
  });

// accept proposal

const acceptJobProposal = asyncHandler(async (req, res) => {
   
    // // Check for client
    if (!req.client) {
     return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
    }
    const id = req.client._id;
    const _id  = req.params._id;
  
    let doc =   await Client.findOne({ _id :id });
  
    if (!doc) {
     return res.status(403).json({ errorMessage: "Unauthorized" });
    }


    doc = await jobProposal.findOne({ _id, client: id});
    
    if (!doc || doc.status == -1 || doc.status == 1) {
     return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
    }
  
    const authorized = await jobProposal.findOne({ _id }).populate('exchangeSkillsId');   // check whom posted this exchange skills request and then check if match then can accept because freelancer who posted can only accrpt
  
    // if (authorized.exchangeSkillsId.freelancer !== id) {
    //   console.log('bye')
    //  return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
    // }
  
    let filter = { _id: _id };
    let update = {
      status: 1
    }

    let payment = await paymentModel.findOne({userId : id })
   
    if(!payment){
       return  res.status(403).json({errorMessage : 'Please First add Payment Method !'})
    }
   const Charges = await  createCharges(payment.CardDetails.email , doc.bid , payment.CardDetails.customerId , payment.CardDetails.cardId)
  
   if(!Charges){
    res.status(400).json({errorMessage : 'Payment failed !'})
   }

   let result = await jobProposal.findOneAndUpdate(filter, update)

  if(result){
    await saveNotifcation(id , result.submittedBy , _id ,'Your Proposal has been accepted !' , result.coverLetters)
    await result.save()
    const response = await jobProposal.findOne({ _id });
  
    const order = await OrderModel.create({
      proposalId: _id,
      submittedBy: response.submittedBy,
      price : doc.bid,
      client : _id,
      type : 'job'
    });

    if(order)
    return res.status(200).json({Order : order , ChargesDetails : Charges })
  }
    
  });
  

  const rejectJobProposal = asyncHandler(async (req, res) => {
    // // Check for client
    if (!req.client) {
     return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
    }
    const id = req.client._id;
    const _id  = req.params._id;
  
    let doc =   await Client.findOne({ _id :id });
  
    if (!doc) {
     return res.status(403).json({ errorMessage: "Unauthorized" });
    }
  

    doc = await jobProposal.findOne({ _id, client: id});
    
    if (!doc || doc.status == -1   ||  doc.status == 1 ) {
     return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
    }
  
    const authorized = await jobProposal.findOne({ _id }).populate('exchangeSkillsId');   // check whom posted this exchange skills request and then check if match then can accept because freelancer who posted can only accrpt
  
    // if (authorized.exchangeSkillsId.freelancer !== id) {
    //   console.log('bye')
    //  return res.status(403).json({ errorMessage: "User is not authorized to access this resource" });
    // }
  
    let filter = { _id: _id };
    let update = {
      status: -1
    }
  
    let result = await jobProposal.findOneAndUpdate(filter, update)
    await saveNotifcation(id , result.submittedBy , _id ,'Your Proposal has been Rejected !' , result.coverLetters)
    await result.save()
    const response = await jobProposal.findOne({ _id });
  
  
    if(response) return res.status(200).json(response)
    
  });
  

  
module.exports = {
    addJob,
    updateJob ,
    deletejob,
    submitProposal,
    getJobProposalsForFreelancer,
    updateProposals,
    getJobProposalsForClient,
    getAllJobs,
    getOneJob,
    getJobForFreelancer,
    acceptJobProposal,
    rejectJobProposal
}