const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const Freelancer = require("../models/freelancerModel");
const blog = require('../models/BlogModel');
const Client = require('../models/clientModel')
const Comments = require('../models/commentModel') 
const RComments = require('../models/RCommentsModel');
const { findOneAndUpdate, count } = require("../models/freelancerModel");
const { json } = require("express");
const mongoose = require("mongoose");
const ReportsFreelancer = require( '../models/ReportsFreelancer' )

// add blog by freelancer
const addblog = async (req, res) => {
  try {
    const { title, story, Category } = req.body;
    if (!title) {
      return res.status(401).send({ msg: "Title field is required" });
    }
    if (!story) {
      return res.status(401).send({ msg: "story field is required" });
    }
    if (!Category) {
      return res.status(401).send({ msg: "Category field is required" });
    }
    if (!req.file) {
      return res.status(401).send({ msg: "photo field is required" });
    }
    const photo = req.file.path;
    // Check for freelancer
    if (!req.freelancer) {
      res.status(401).json({ errorMessage: "User Cannot access this Route" });
    } else {
      const { id } = req.freelancer;
      // console.log( id );
      const freelancerExists = await Freelancer.findById(id);
      if (!freelancerExists) {
        res.status(403).json({ errorMessage: "Unauthorized" });
      }
      const response = await blog.create({
       freelancer: id,
        title,
        story,
        photo,
        Category
      });
      if(response){
        let previousblogs = await ReportsFreelancer.find( { freelancer: id } )
        let count = previousblogs[0]?.TotalBlogs || 0;
        let filter = { freelancer: id }
        let update = { TotalBlogs: count + 1 }
       await ReportsFreelancer.findOneAndUpdate(filter, update, { upsert: true, new : true } );
        return res.status(200).json({response});
      }
      else{
        return res.status(400).send({errorMessage: 'error insetring data in database'})
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// update blog by freelancer
const updateblog = async (req, res) => {
  try {
    const { title, story, Category } = req.body;
    // Check for freelancer
    if (!req.freelancer) {
     return res.status(401).json({ errorMessage: "User Cannot access this Route" });
    } else { 
      const { id } = req.freelancer;
      // console.log(id);
      const freelancerExists = await Freelancer.findById(id);
      if (!freelancerExists) {
       return res.status(403).json({ errorMessage: "Unauthorized" });
      }
      else{
      const FreelancerID = id
      const blogid = req.params.blog_id
      if (!mongoose.isValidObjectId(blogid)) {
        return res.status(401).send({errorMessage: `Enter valid id`})
   }
         // if user doesnot update photo
      const filter = {_id: blogid}
      if(!filter){return res.status(401).send({errorMessage: 'blog id is required to update'})}
      if (!req.file) {
        const update = {
          FreelancerID,
          title,
          story,
          Category
        };
        const response = await blog.findOneAndUpdate(filter,update);
        response.save();
        const result = await blog.find({_id:response._id});
        if(result){
          return res.status(200).json({result});
        }
      }
      // if user update photo
      else{
        const photo = req.file.path;
        const response = await blog.findOneAndUpdate(filter,update)
        const update ={
          FreelancerID,
          title,
          story,
          photo,
          Category
        };
        if(response){
          return res.status(200).json({response});
        }
      }
    }
    }
  } catch (error) {
    console.log(error);
  }
};


//  client can see all blog posted by freelancer
const get_all_blogs = async (req, res) => {
  try{
    
    // check if it is client 
    if (req.freelancer) {return res.status(401).json({ errorMessage: "User Cannot access this Resource" });}
    if(req.client == null) {return res.status(401).json({ errorMessage: 'client doesnot exists'})}
      const { id } = req.client
      const clientExists = await Client.findOne({ id });
      if (!clientExists) {
        return res.status(401).json({ errorMessage: "client dosen't exists in database" });
      }
      const snapshot = await blog.find().populate('freelancer').populate('comment').populate('RComments');
      if(!snapshot){
        return res.status(401).send({msg: 'No blog added yet!'})
      }else{
        return res.status(200).send({snapshot})
      }
  }
  catch(error){
    console.log(error)
  }
};

// Only client can comment on freelancer blog 
const add_comment = async (req, res) => {
  try{
    // check if it is client 
    if (req.freelancer) {return res.status(401).json({ errorMessage: "User Cannot access this Resource" });}
    if(req.client == null) {return res.status(401).json({ errorMessage: 'client doesnot exists'})}
      const { id } = req.client
      const clientExists = await Client.findById(id);
      if (!clientExists) {
        return res.status(401).json({ errorMessage: "client dosen't exists in database." });
      }
      const {comment} = req.body
      if(!comment){ return res.status(401).json({ errorMessage: "comment field is required" });}
      const blog_id = req.params.blog_id
      if (!mongoose.isValidObjectId(blog_id)) {
        return res.status(401).send({errorMessage: `Enter valid id`})
   }
      const blogExists = await blog.findOne({ blog_id });
      if (!blogExists) {
        return res.status(401).json({ errorMessage: "blog dosen't exists" });
      }
      const snapshot = await Comments.create({
        comment,
        Blog_id: blog_id,
        client_id: id
      })
      if(!snapshot){
        return res.status(401).send({msg: 'error adding comment'})
      }else{
        const _id  = snapshot._id;
        const filter  = { _id : blog_id };
        const up = { $push:{comment : _id } }
        await blog.findOneAndUpdate(filter,up);
        return res.status(200).send(snapshot)
      }
  }
  catch(error){
    console.log(error)
  }
};

// Only client can reply to comments on freelancer blog 
const reply_comment = async (req, res) => {
  try{
    // check if it is client 
    if (req.freelancer) {return res.status(401).json({ errorMessage: "User Cannot access this Resource" });}
    if(req.client == null) {return res.status(401).json({ errorMessage: 'client doesnot exists'})}
      const { id } = req.client
      const clientExists = await Client.findById(id);
      if (!clientExists) {
        return res.status(401).json({ errorMessage: "client dosen't exists in database" });
      }
      const {Rcomment} = req.body
      if(!Rcomment){ return res.status(401).json({ errorMessage: "Rcomment field is required" });}
      const blog_id = req.params.blog_id
      if (!mongoose.isValidObjectId(blog_id)) {
        return res.status(401).send({errorMessage: `Enter valid id`})
   }
      if(!blog_id){ return res.status(401).json({ errorMessage: "blog id is required" });}
      const comment_id = req.params.comment_id
      if (!mongoose.isValidObjectId(comment_id)) {
        return res.status(401).send({errorMessage: `Enter valid id`})
   }
      if(!comment_id){ return res.status(401).json({ errorMessage: "comment id is required" });}

      const blogExists = await blog.findById(blog_id);
      if (!blogExists) {
        return res.status(401).json({ errorMessage: "blog dosen't exists" });
      }

      const commentExists = await Comments.findById(comment_id)
      if (!commentExists) {
        return res.status(401).json({ errorMessage: "comment dosen't exists" });
      }
      const snapshot = await RComments.create({
        Rcomment,
        Blog_id: blog_id,
        client_id: id,
        Comment_id: comment_id
      })
      if(!snapshot){
        return res.status(401).send({msg: 'error adding Rcomment'})
      }else{
        const filter = { _id: blog_id }
        const updateR = { $push: { RComments: snapshot._id }}
        await blog.findOneAndUpdate( filter,updateR )
        return res.status(200).send({snapshot})
      }
  }
  catch(error){
    console.log(error)
  }
};

// get all blogs for freelancer except its own blogs
const get_freelancer_blogs = async (req, res) => {
  try{
    // if (req.client) {return res.status(401).json({ errorMessage: "User Cannot access this Resource" })}
    if(req.freelancer){
    if(req.freelancer == null) {return res.status(401).json({ errorMessage: 'freelancer doesnot exists'})}
      const { id } = req.freelancer
      console.log(id);
      const freelancerExists = await Client.findOne({ id });
      if (!freelancerExists) { return res.status(401).json({ errorMessage: "freelancer dosen't exists in database" });}
      //  get data from database
      const snapshot = await blog.find({ freelancer: {$ne: id} }).populate('freelancer').populate('comment').populate('RComments');
      if(!snapshot){
        return res.status(401).send({msg: 'No blog added yet!'})
      }else{
        return res.status(200).send({snapshot})
      }
    }else{return res.status(401).send({errorMessage: 'client cannot access this route'})}
  }
  catch(error){
    console.log(error)
  }
};


const deleteblog= async (req, res) => {
  try{
    if ( !req.freelancer ) { return res.status(401).json({ errorMessage: "User Cannot access this Resource" } ) }
    let { id } = req.freelancer
    let FreelancerExists = Freelancer.findById ( id )
    if ( !FreelancerExists ) return res.status(401).send({ errorMessage: 'Unauthorized'})
      //blog exists or not
      let blog_id = req.params.blog_id
      if (!mongoose.isValidObjectId(blog_id)) {
        return res.status(401).send({errorMessage: `Enter valid id`})
   }
   
      let checkblog = await blog.findById(blog_id)
      if(!checkblog){ return res.status(401).send({errorMessage: `blog not found with given id: ${blog_id}`})}
      
      await blog.deleteOne({_id: blog_id})
      await Comments.deleteMany({_id: checkblog.comment})
      await RComments.deleteMany({_id: checkblog.RComments})
      let previousblogs = await ReportsFreelancer.find( { freelancer: id } )
      if ( previousblogs ) {
        let count = previousblogs[0]?.TotalBlogs || 0
        let filter = { freelancer: id }
        let update = { TotalBlogs: count - 1 }
       await ReportsFreelancer.findOneAndUpdate(filter, update, { upsert: true, new : true } )

      }
      return res.status(200).send({ msg:`success   deleted blog with id:${blog_id}`})
    }
  
  catch (error) { console.log(error) }
}

module.exports = {
  addblog,
  get_all_blogs,
  add_comment,
  reply_comment,
  updateblog,
  get_freelancer_blogs,
  deleteblog
};
