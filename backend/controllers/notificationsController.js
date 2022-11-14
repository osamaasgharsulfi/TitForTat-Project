const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const Freelancer = require("../models/freelancerModel");
const blog = require('../models/BlogModel');
const Client = require('../models/clientModel')
const Comments = require('../models/commentModel')
const RComments = require('../models/RCommentsModel');
const {
  findOneAndUpdate
} = require("../models/freelancerModel");
const {
  json
} = require("express");
const mongoose = require("mongoose");
const gigs = require('../models/gigModel')
const Orders = require('../models/orderModel')
const notify = require('../models/notficationsModel')



// when client creates order
const read_notification = async (req, res) => {
  try {
    // check for freelancer
    if (!req.freelancer && !req.client) {
      return res.status(401).send({
        errorMessage: 'Unauthorized'
      })
    }
    let id = req.freelancer ? req.freelancer._id : req.client._id;
    id = req.client ? req.client._id : req.freelancer._id;

    const check_freelancer = await Freelancer.findById(id)
    const check_client = await Client.findById(id)
    if (!check_freelancer && !check_client) {
      return res.status(401).send({
        errorMessage: 'Unauthorized'
      })
    }

    const get_notification = await notify.find({
      sendto: id
    }).populate('sendto').populate('sendfrom')
    return res.status(200).send(get_notification);
  } catch (error) {
    console.log(error)
  }
}


module.exports = {
  read_notification
}