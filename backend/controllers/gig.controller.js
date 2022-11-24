const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const Freelancer = require("../models/freelancerModel");
const blog = require('../models/BlogModel');
const Client = require('../models/clientModel')
const Comments = require('../models/commentModel')
const RComments = require('../models/RCommentsModel');
const { findOneAndUpdate } = require("../models/freelancerModel");
const { json } = require("express");
const mongoose = require("mongoose");
const gigs = require('../models/gigModel')
const Orders = require('../models/orderModel')
const { saveNotifcation } = require('../utils/Notification')
const Review = require('../models/FreelancerReviews')
const moment = require ( 'moment' )
const ClientReview = require ( '../models/ClientReviews' );
const ReportsFreelancer = require ( '../models/ReportsFreelancer' );
const ReportsClient = require ( '../models/ReportsClient' )

// add gig
const add_gig = async (req, res) => {

  try {
    const { title, Category, skills, BASIC, STANDARD, PREMIUM, description, requirements } = req.body;
    if (!title) { return res.status(401).send({ msg: "Title field is required" }) }

    if (!skills) { return res.status(401).send({ msg: "skills field is required" }) }

    if (!Category) { return res.status(401).send({ msg: "Category field is required" }) }

    if (!BASIC) { return res.status(401).send({ msg: "BASIC field is required" }) }

    if (!STANDARD) { return res.status(401).send({ msg: "BASIC field is required" }) }

    if (!PREMIUM) { return res.status(401).send({ msg: "BASIC field is required" }) }

    if (!description) { return res.status(401).send({ msg: "BASIC field is required" }) }

    if (!requirements) { return res.status(401).send({ msg: "BASIC field is required" }) }

    if (!BASIC.name || !BASIC.details || !BASIC.time || !BASIC.revisions || !BASIC.Price) {
      return res.status(401).send({ errorMessage: `All basic fields are required.` })
    }
    if (!STANDARD.name || !STANDARD.details || !STANDARD.time || !STANDARD.revisions || !STANDARD.Price) {
      return res.status(401).send({ errorMessage: `All STANDARD fields are required.` })
    }
    if (!PREMIUM.name || !PREMIUM.details || !PREMIUM.time || !PREMIUM.revisions || !PREMIUM.Price) {
      return res.status(401).send({ errorMessage: `All STANDARD fields are required.` })
    }

    if (skills.length > 3) {
      return res.status(400).send({ msg: `you cannot add more than three skills.` })
    };

    if (!req.file) { return res.status(401).send({ msg: "attachments field is required" }) }

    const attachments = req.file.path;

    // Check for freelancer
    if (!req.freelancer) { res.status(401).json({ errorMessage: "Unauthorized" }) }
    else {
      const { id } = req.freelancer;
      const freelancerExists = await Freelancer.findById(id)
      if (!freelancerExists) { res.status(403).json({ errorMessage: "Unauthorized" }) }
      // save data in database
      const response = await gigs.create({
        freelancer: id,
        title,
        skills,
        attachments,
        Category,
        BASIC,
        STANDARD,
        PREMIUM,
        description,
        requirements
      });
      if (response) {
        let previousblogs = await ReportsFreelancer.find( { freelancer: id } )
        let count = previousblogs[0]?.TotalGigs || 0;
        let filter = { freelancer: id }
        let update = { TotalGigs: count + 1 }
       await ReportsFreelancer.findOneAndUpdate(filter, update, { upsert: true, new : true } );
        
        
        return res.status(200).json({ response })
      }
      else { return res.status(400).send({ errorMessage: `error inserting data in database` }) }
    }
  } catch (error) {
    console.log(error);
  }
}

// edit gig
const edit_gig = async (req, res) => {
  try {
    const { title, Category, skills, BASIC, STANDARD, PREMIUM, description, requirements } = req.body;
    const gigid = req.params.gig_id
    if (!mongoose.isValidObjectId(gigid)) {
      return res.status(401).send({ errorMessage: `Enter valid id` })
    }

    if (!req.freelancer) { res.status(401).json({ errorMessage: "Client Cannot access this Route" }) }

    const { id } = req.freelancer;
    const freelancerExists = await Freelancer.findById(id);
    if (!freelancerExists) { res.status(403).json({ errorMessage: "Unauthorized" }) }
    // if user didnot attach photo
    if (!req.file) {
      const response = await gigs.findByIdAndUpdate(gigid, {
        title,
        skills,
        Category,
        BASIC,
        STANDARD,
        PREMIUM,
        description,
        requirements
      });
      if (response) {
        return res.status(200).json({ response })
      }
      else { return res.status(400).send({ errorMessage: `no gig found with ${gigid}` }) }
    }

    const attachments = req.file.path;
    if (req.file) {
      // save data in database
      const response = await gigs.findByIdAndUpdate(gigid, {
        title,
        skills,
        attachments,
        Category,
        BASIC,
        STANDARD,
        PREMIUM,
        description,
        requirements
      });
      if (response) {
        return res.status(200).json({ response })
      }
      else { return res.status(400).send({ errorMessage: `no gig found with ${gigid}` }) }
    }
  }
  catch (error) { console.log(error) }
}

// delete gig
const delete_gig = async (req, res) => {
  try {
    const gigid = req.params.gig_id
    if (!mongoose.isValidObjectId(gigid)) {
      return res.status(401).send({ errorMessage: `Enter valid id` })
    }
    // Check for freelancer
    if (!req.freelancer) { res.status(401).json({ errorMessage: "Client Cannot access this Route" }) }
    else {
      const { id } = req.freelancer;
      // console.log(id);
      const freelancerExists = await Freelancer.findById(id);
      if (!freelancerExists) { res.status(403).json({ errorMessage: "Unauthorized" }) }
      // save data in database
      const response = await gigs.findById(gigid)

      if (response) {
        await gigs.deleteOne({ _id: gigid })
        let count = freelancerExists.total_gigs || 0
        count = count - 1
        await Freelancer.findByIdAndUpdate(id, { total_gigs: count })
        return res.status(200).json({ msg: `Gig successfully deleted with given id: ${gigid}` })
      }
      else { return res.status(400).send({ errorMessage: `no gig found with id: ${gigid}` }) }
    }
  } catch (error) { console.log(error) }
}

// show all gigs with freelancer
const get_gigs = async (req, res) => {
  try {
    // Check for freelancer
    if (!req.freelancer) { res.status(401).json({ errorMessage: "Client Cannot access this Route" }) }
    else {
      const { id } = req.freelancer;
      // console.log(id);
      const freelancerExists = await Freelancer.findById(id);
      if (!freelancerExists) { res.status(403).json({ errorMessage: "Unauthorized" }) }
      // save data in database
      const response = await gigs.find().populate('freelancer')

      if (response) {
        return res.status(200).send(response)
      }
      else { return res.status(400).send({ errorMessage: `no gig found with id: ${gigid}` }) }
    }
  } catch (error) { console.log(error) }
}

// when client creates order
const create_order = async (req, res) => {
  try {
    // Check for client
    if (!req.client) { res.status(401).json({ errorMessage: "User Cannot access this Route" }) }

      const gig_id = req.params.gig_id
      if (!mongoose.isValidObjectId(gig_id)) {
        return res.status(401).send({ errorMessage: `Enter valid gig id` })
      }
      const chechgig = await gigs.findById(gig_id)
      //  console.log(chechgig.freelancer)
      if (!chechgig) { return res.status(401).send({ errorMessage: ` no gig found with id: ${gig_id}` }) }
      const { id } = req.client;
      const clientExists = await Client.findById(id);
      if (!clientExists) { return res.status(403).json({ errorMessage: "Unauthorized" }) }
      const pack = req.body.package.toUpperCase()
      if (!pack) { return res.status(400).send({ errorMessage: `pack field is required` }) }

      if ( pack == 'BASIC' ) { 
      var price = chechgig.BASIC.Price 
      var duration = chechgig.BASIC.time
      }
      if ( pack == 'STANDARD' ) { 
      var price = chechgig.STANDARD.Price 
      var duration = chechgig.STANDARD.time
      }
      if ( pack == 'PREMIUM' ) { 
      var price = chechgig.PREMIUM.Price 
      var duration = chechgig.PREMIUM.time
      }
      //  { return res.status(400).send({ msg: ` Please select package only basic, standard or premium` }) }

      const saveOrder = Orders.create ( { 
      type: 'gig',
      client: id,
      proposalId: gig_id,
      freelancer: chechgig.freelancer,
      price: price,
      duration: duration,
      status: '2'
       } )
      await saveNotifcation(id, chechgig.freelancer, gig_id, 'Order Created on Your gig', chechgig.title)
      
      let previousblogs = await ReportsFreelancer.find( { freelancer: chechgig.freelancer } )
      let count = previousblogs[0]?.TotalOrders || 0;
      let filter = { freelancer: chechgig.freelancer }
      let update = { TotalOrders: count + 1 }
      await ReportsFreelancer.findOneAndUpdate( filter, update, { upsert: true, new : true } );
      

      let previousEarning = await ReportsClient.find ( { client: id } )
      let earn = previousEarning[0]?.TotalSpend || 0;
      let f = { client: id }
      let u = { client : id,  TotalSpend: earn + price }

      await ReportsClient.findOneAndUpdate( f, u, { upsert: true, new : true } )
      return res.status(200).send({ msg: `Order created successfully` })    

  } catch (error) { console.log(error) }
}

// get pending Orders
const getOrders = async (req, res) => {
  try {
    if (!req.freelancer) { return res.status(401).send({ errorMessage: 'User cannot access this route' }) }
    const { id } = req.freelancer;

    const getAllOrders = await Orders.find( { freelancer: id, status: '2' } ).populate( 'client' ).populate ( 'freelancer' )

    return res.status(200).send(getAllOrders)
  }
  catch (error) { console.log(error) }
}


// accept, reject, pending order
const responseOrder = async (req, res) => {
  try {

    if (!req.freelancer) { return res.status(401).send({ errorMessage: 'User cannot access this route' }) }
    const { id } = req.freelancer;
    const { status } = req.body;
    const OrderId = req.params.OrderId
    if (!status) { return res.status(401).send({ errorMessage: 'status field is required' }) }
    const OrderExists = await Orders.findById(OrderId)
    if (!OrderExists) { return res.status(404).send({ errorMessage: 'Record not found' }) }

    if (status == '1') {

    // Order completion date
    
    var OrderExp = new Date(new Date().getTime()+( OrderExists.duration *24*60*60*1000 ) )
    const updateOrderStatus = await Orders.findByIdAndUpdate(OrderId, { status: '1', OrderExp: OrderExp })

    let previousblogs = await ReportsFreelancer.find( { freelancer: id } )
      let count = previousblogs[0]?.TotalCompletedOrder || 0;
      let earn = previousblogs[0]?.TotalEarned || 0;
      let filter = { freelancer: id }
      let update = { TotalCompletedOrder: count + 1 , TotalEarned: earn  + OrderExists.price }
     await ReportsFreelancer.findOneAndUpdate(filter, update, { upsert: true, new : true } );

    return res.status(200).send({ messsage: 'Order accepted' })
    }

    if (status == '0') {

    const updateOrderStatus = await Orders.findByIdAndUpdate(OrderId, { status: '0' })

    let previousblogs = await ReportsFreelancer.find( { freelancer: id } )

      let count = previousblogs[0]?.TotalRejectedOrder || 0;
      let filter = { freelancer: id }
      let update = { TotalRejectedOrder: count + 1 }
     await ReportsFreelancer.findOneAndUpdate(filter, update, { upsert: true, new : true } );

    return res.status(200).send({ messsage: 'Order rejected' })
    }

  }
  catch (error) { console.log(error) }
}


// Reviews and Ratings of freelancer
const ReviewsAndRatings = async (req, res) => {
  try {
    const orderID = req.params.id;
    if (!req.client) { return res.status(401).send({ errorMessage: 'User cannot access this route' }) }
    //check if order exists and accepted or not
    const OrderExists = await Orders.findById ( orderID );
    if ( !OrderExists ) { return res.status(404).send ( { errorMessage: 'No Order found' } ) }
    if ( OrderExists.status != '1' ) { return res.status( 403 ).send ( { errorMessage: 'Only accepted Orders can be reviewd' } ) }

    const CheckReview = await Review.find( { OrderId: orderID, ClientId: OrderExists.client } );
    if ( CheckReview.exists ) return res.status(403 ).send ( { errorMessage: 'Already Reviewd' } )

    const { review, rating } = req.body
    if ( !review || !rating ) return res.status(401).send( { errorMessage: `All fields are required` } )
    if ( rating > '5' || rating <= '0'  ) return res.status(401).send( { errorMessage: ` Ratings must be between 1 to 5 ` } )
    let start = new Date()
    let end =  new Date ( OrderExists.OrderExp)
    if ( start >= end ) {
    Review.create ( { 
      OrderId : orderID,
      ClientId : OrderExists.client,
      Ratings: rating,
      Review: review,
      freelancer: OrderExists.freelancer
     } )
     return res.status(200).send( { messsage: 'Review added successfully' } )
    }
    else{
      return res.status( 401 ).send( { errorMessage: `You cannot add review before ${ OrderExists.OrderExp } ` } )
    }
  }
  catch (error) { console.log(error) }
}

// get all freelancer review by id
const getFreelancerReviews = async (req, res) => {
  try {
    if ( !req.freelancer || !req.client ) { return res.status(401).send({ errorMessage: 'User cannot access this route' }) }
    const  id  = req.params.id
    if ( !mongoose.isValidObjectId( id ) ) 
    { return res.status(401).send ( { errorMessage: `Enter valid id` } ) }

    const FreelancerExists = await Freelancer.findById ( id );
    if( ! FreelancerExists )  return res.status(401).send( { errorMessage: 'Unauthorized' } );

    const getAllReviews = await Review.find( { freelancer: id } ).populate( 'ClientId' ).populate ( 'freelancer' ).populate ( 'OrderId' )

    return res.status(200).send(getAllReviews)
  }
  catch (error) { console.log(error) }
}


// Reviews and Ratings of Client
const ReviewsClient = async (req, res) => {
  try {
    const orderID = req.params.id;
    if ( !req.freelancer ) { return res.status(401).send({ errorMessage: 'User cannot access this route' }) }
    let { id } = req.freelancer
    const FreelancerExists = await Freelancer.findById ( id )
    if ( !FreelancerExists ) return res.status(401).send({ errorMessage: Unauthorized })
    //check if order exists and accepted or not
    const OrderExists = await Orders.findById ( orderID );
    if ( !OrderExists ) { return res.status(404).send ( { errorMessage: 'No Order found' } ) }
    if ( OrderExists.status != '1' ) { return res.status( 403 ).send ( { errorMessage: 'Only accepted Orders can be reviewd' } ) }

    // const CheckReview = await ClientReview.find( { OrderId: orderID,  } );
    // if ( CheckReview.exists ) return res.status(403 ).send ( { errorMessage: 'Already Reviewd' } )

    const { review, rating } = req.body
    if ( !review || !rating ) return res.status(401).send( { errorMessage: `All fields are required` } )
    if ( rating > '5' || rating <= '0'  ) return res.status(401).send( { errorMessage: ` Ratings must be between 1 to 5 ` } )
    let start = new Date()
    let end =  new Date ( OrderExists.OrderExp)
    if ( start >= end ) {
    ClientReview.create ( { 
      OrderId : orderID,
      freelancer : OrderExists.freelancer,
      Ratings: rating,
      Review: review,
      client: OrderExists.client
     } )
     return res.status(200).send( { messsage: 'Review added successfully' } )
    }
    else{
      return res.status( 401 ).send( { errorMessage: `You cannot add review before ${ OrderExists.OrderExp } ` } )
    }
  }
  catch (error) { console.log(error) }
}


// get Client reviews by id
const getClientReviews = async (req, res) => {
  try {
    if ( !req.freelancer || !req.client ) { return res.status(401).send({ errorMessage: 'User cannot access this route' }) }
    const  id  = req.params.id
    if ( !mongoose.isValidObjectId( id ) ) 
    { return res.status(401).send ( { errorMessage: `Enter valid id` } ) }

    const CLientExists = await Client.findById ( id );
    if( ! CLientExists )  return res.status(401).send( { errorMessage: 'Unauthorized' } );

    const getAllReviews = await ClientReview.find( { client: id } ).populate( 'ClientId' ).populate ( 'freelancer' ).populate ( 'OrderId' )

    return res.status(200).send(getAllReviews)
  }
  catch (error) { console.log(error) }
}

// Freelancer Report
const getFreelancerReoprt = async (req, res) => {
  try {
    if ( !req.freelancer || !req.client ) { return res.status(401).send({ errorMessage: 'User cannot access this route' }) }
    const  id  = req.params.id
    if ( !mongoose.isValidObjectId( id ) ) 
    { return res.status(401).send ( { errorMessage: `Enter valid id` } ) }

    const FreelancerExists = await Freelancer.findById ( id );
    if( !FreelancerExists )  return res.status(401).send( { errorMessage: 'Unauthorized' } );

    const getReport = await ReportsFreelancer.find( { freelancer: id } ).populate ( 'freelancer' )

    return res.status(200).send(getReport)
  }
  catch (error) { console.log(error) }
}


// Client Report
const getClientReoprt = async (req, res) => {
  try {
    if ( !req.freelancer || !req.client ) { return res.status(401).send({ errorMessage: 'User cannot access this route' }) }
    const  id  = req.params.id
    if ( !mongoose.isValidObjectId( id ) ) 
    { return res.status(401).send ( { errorMessage: `Enter valid id` } ) }

    const ClientExists = await Client.findById ( id );
    if( !ClientExists )  return res.status(401).send( { errorMessage: 'Unauthorized' } );

    const getReport = await ReportsClient.find( { client: id } ).populate ( 'client' )

    return res.status(200).send(getReport)
  }
  catch (error) { console.log(error) }
}


//  get Order by id
const getOrder = async (req, res) => {
  try {
    if ( !req.freelancer || !req.client ) { return res.status(401).send({ errorMessage: 'User cannot access this route' }) }
    const  id  = req.params.id

    if ( !mongoose.isValidObjectId( id ) ) {
    return res.status(401).send({errorMessage: `Enter valid id`})
    }

    const getOrder = await Orders.findById( id ).populate( 'freelancer' ).populate ( 'client' )

    if ( !getOrder ) return res.status(404).send ( { errorMessage: `No Order found with id: ${ id } ` } )

    return res.status(200).send (  getOrder  )
  }
  catch (error) { console.log(error) }
}


module.exports = {
  add_gig,
  edit_gig,
  delete_gig,
  get_gigs,
  create_order,
  getOrders,
  responseOrder,
  ReviewsAndRatings,
  ReviewsClient,
  getFreelancerReviews,
  getClientReviews,
  getFreelancerReoprt,
  getClientReoprt,
  getOrder
}