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
const jobModel = require('../models/jobModel')
const gigModel = require('../models/gigModel')
const blogModel = require('../models/BlogModel')

//REGISTER admin

const registerAdmin = (async (req, res) => {
    const { username, email, password, secret } = req.body;

    if (!username || !email || !password || !secret) {
        return res.status(400).json("Please add all fields")
    }

    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
        return res.status(403).json({ errorMessage: "Admin already exists" });
    }

    if (secret == process.env.ADMINSECRET) {
        const admin = await Admin.create({
            username,
            email,
            password,
            isAdmin: true
        });

        if (!admin) {
            return res.status(400).json({ errorMessage: "Invalid Admin data" })
        }

        const { _id, Email, isAdmin } = admin

        const token = jwt.sign({ _id, type: "admin" }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });


        return res.status(201).json({
            _id: admin._id,
            email: Email,
            token: token,
            isAdmin: isAdmin
        });
    }
    else {
        return res.status(400).json({ errorMessage: "Please Enter correct Secret Value" });
    }
});

// admin login
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for freelancer email
    const admin = await Admin.findOne({ email });

    if (admin && (await bcrypt.compare(password, admin.password))) {
        const { _id, Email } = admin

        res.json({

            _id: admin.id,
            email: admin.email,
            token: jwt.sign({ _id , type: "admin" }, process.env.JWT_SECRET, { expiresIn: "30d", }),
        });

    } else {
        return res.status(401).json({ errorMessage: "Invalid Freelancer Credentials" });
    }
});


//   get freelancer 
const getFreelancers = asyncHandler(async (req, res) => {
    // Check for admin
    if (!req.admin) {
        return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
    }

    const { id } = req.admin
    const admin = await Admin.findOne({ _id :id });

    if (!admin) {
        return res.status(403).json({ errorMessage: "Unauthorized" });
    }

    let response = await Freelancer.find();

    if (response) {
        return res.status(200).json(response)
    }
    else {
        return res.status(400).json({ errorMessage: "Error Occured" });
    }
})

//   get Clients 
const getClients = asyncHandler(async (req, res) => {
    
        // Check for admin
        if (!req.admin) {
            return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
        }
    
        const { id } = req.admin
        const admin = await Admin.findOne({ _id :id  });
    
        if (!admin) {
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }
    
        let response = await Client.find();
    
        if (response) {
            return res.status(200).json(response)
        }
        else {
            return res.status(404).json({ errorMessage: "Error Occured" });
        }
    })

    //   get  ExchangeSkills 
const getExchangeSkills = asyncHandler(async (req, res) => {
        // Check for admin
        if (!req.admin) {
            return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
        }
    
        const { id } = req.admin
        const admin = await Admin.findOne({ _id :id  });
    
        if (!admin) {
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }
    
        let response = await ExchangeSkills.find();
    
        if (response) {
            return res.status(200).json(response)
        }
        else {
            return res.status(404).json({ errorMessage: "Error Occured" });
        }
    })

//   get  proposals of one  Exchange skills
const getProposal = asyncHandler(async (req, res) => {
   const _id = req.body._id
    // Check for admin
    if (!req.admin) {
        return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
    }

    const { id } = req.admin
    const admin = await Admin.findOne({ _id :id  });

    if (!admin) {
        return res.status(403).json({ errorMessage: "Unauthorized" });
    }

    let response = await proposalModel.find({ExchangeSkillsId : _id}).populate("exchangeSkillsId").populate("submittedBy").populate("freelancer")

    if (response) {
        return res.status(200).json(response)
    }
    else {
        return res.status(404).json({ errorMessage: "Error Occured" });
    }
})

//   delete freelancer 
const deleteFreelancer = asyncHandler(async (req, res) => {
    const { _id } = req.body
        // Check for admin
        if (!req.admin) {
            return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
        }
    
        const { id } = req.admin
        const admin = await Admin.findOne({ _id :id  });
    
        if (!admin) {
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }

        let freelancer= await Freelancer.findOne({_id : _id})

        if(freelancer){
            let response = await Freelancer.deleteOne({_id : _id})

            if (response.deletedCount == 1) {
                return res.status(200).json("Freelancer Successfully Deleted")
            }
            else {
                return res.status(400).json({ errorMessage: "Error Occured" });
            }
        }else{
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }
    })


    //   delete clinets 
const deleteClients = asyncHandler(async (req, res) => {
    const { _id } = req.body
        // Check for admin
        if (!req.admin) {
            return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
        }
    
        const { id } = req.admin
        const admin = await Admin.findOne({ _id :id  });
    
        if (!admin) {
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }

        let client= await Client.findOne({_id : _id})

        if(client){
            let response = await Client.deleteOne({_id : _id})

            if (response.deletedCount == 1) {
                return res.status(200).json("Client Successfully Deleted")
            }
            else {
                return res.status(400).json({ errorMessage: "Error Occured" });
            }
        }else{
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }
    })

        //   delete  ExchangeSkills 
const deleteExchangeSkills = asyncHandler(async (req, res) => {
    const { _id } = req.body
        // Check for admin
        if (!req.admin) {
            return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
        }
    
        const { id } = req.admin
        const admin = await Admin.findOne({ _id :id  });
    
        if (!admin) {
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }

    let exchangeSkill = await exchangeSkills.findOne({ _id: _id })

    if (exchangeSkill) {
        let result = await exchangeSkills.deleteOne({ _id: _id })

            let response = await proposalModel.deleteMany({ ExchangeSkillsId: _id })
                return res.status(200).json(`Exchange Skills And ${response.deletedCount} Submitted Proposals On Exchange Skills  Successfully Deleted`)
        }
     else {
        return res.status(403).json({ errorMessage: "Unauthorized" });
    }
})


    //   get  job 
    const getJobs = asyncHandler(async (req, res) => {
        // Check for admin
        if (!req.admin) {
            return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
        }
    
        const { id } = req.admin
        const admin = await Admin.findOne({ _id :id  });
    
        if (!admin) {
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }
    
        let response = await jobModel.find();
    
        if (response) {
            return res.status(200).json(response)
        }
        else {
            return res.status(404).json({ errorMessage: "Error Occured" });
        }
    })

                //   delete jobs 
const deleteJobs = asyncHandler(async (req, res) => {
    const { _id } = req.body
        // Check for admin
        if (!req.admin) {
            return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
        }
    
        const { id } = req.admin
        const admin = await Admin.findOne({ _id :id  });
    
        if (!admin) {
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }

        let job= await jobModel.findOne({_id : _id})

        if(job){
            let response = await jobModel.deleteOne({_id : _id})

            if (response.deletedCount == 1) {
                return res.status(200).json("Client Successfully Deleted")
            }
            else {
                return res.status(400).json({ errorMessage: "Error Occured" });
            }
        }else{
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }
    })

       //   get  gig 
       const getGigs = asyncHandler(async (req, res) => {
        // Check for admin
        if (!req.admin) {
            return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
        }
    
        const { id } = req.admin
        const admin = await Admin.findOne({ _id :id  });
    
        if (!admin) {
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }
    
        let response = await gigModel.find();
    
        if (response) {
            return res.status(200).json(response)
        }
        else {
            return res.status(404).json({ errorMessage: "Error Occured" });
        }
    })

                    //   delete jobs 
const deleteGigs= asyncHandler(async (req, res) => {
    const { _id } = req.body
        // Check for admin
        if (!req.admin) {
            return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
        }
    
        const { id } = req.admin
        const admin = await Admin.findOne({ _id :id  });
    
        if (!admin) {
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }

        let gig= await gigModel.findOne({_id : _id})

        if(gig){
            let response = await gigModel.deleteOne({_id : _id})

            if (response.deletedCount == 1) {
                return res.status(200).json("Client Successfully Deleted")
            }
            else {
                return res.status(400).json({ errorMessage: "Error Occured" });
            }
        }else{
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }
    })

         //   get  blogs 
         const getBlogs = asyncHandler(async (req, res) => {
            // Check for admin
            if (!req.admin) {
                return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
            }
        
            const { id } = req.admin
            const admin = await Admin.findOne({ _id :id  });
        
            if (!admin) {
                return res.status(403).json({ errorMessage: "Unauthorized" });
            }
        
            let response = await blogModel.find();
        
            if (response) {
                return res.status(200).json(response)
            }
            else {
                return res.status(404).json({ errorMessage: "Error Occured" });
            }
        })


            //   delete blogs 
const deleteBlogs = asyncHandler(async (req, res) => {
    const { _id } = req.body
        // Check for admin
        if (!req.admin) {
            return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
        }
    
        const { id } = req.admin
        const admin = await Admin.findOne({ _id :id  });
    
        if (!admin) {
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }

        let blog= await blogModel.findOne({_id : _id})

        if(blog){
            let response = await blogModel.deleteOne({_id : _id})

            if (response.deletedCount == 1) {
                return res.status(200).json("Client Successfully Deleted")
            }
            else {
                return res.status(400).json({ errorMessage: "Error Occured" });
            }
        }else{
            return res.status(403).json({ errorMessage: "Unauthorized" });
        }
    })
        

    
    
module.exports = {
    registerAdmin,
    loginAdmin ,
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
    deleteGigs
}