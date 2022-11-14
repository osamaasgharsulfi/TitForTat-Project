const path = require("path");
const express = require("express");
const dotenv = require("dotenv").config();
const colors = require("colors");
const cors = require("cors");
const {
  errorHandler
} = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const { protect } = require("./middleware/authMiddleware");
connectDB();

const app = express();

const port = process.env.PORT || 5000;
/* app.use(cors); */

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));

app.use("/api/client", require("./routes/clientRoutes"));
app.use("/api/freelancer", require("./routes/freelancerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/job", require("./routes/jobRoutes"));

app.use("/api/blog", require("./routes/blog.Routes"));
app.use("/api/gig", require("./routes/gig.Routes"));
app.use("/api", require("./routes/notifications.Routes"));



app.get('/', (req, res) => {
  res.send('hello hamza')
})



app.post("/payment", protect, async (req, res) => {


  const paymentModel = require('./models/payment')
  const Client = require('./models/clientModel')
  const Freelancer = require('./models/freelancerModel')

  const Stripe = require('stripe')
  const stripe = process.env.stripeKey;

  if (!req.client && !req.freelancer) {
    return res.status(401).json({ errorMessage: "User Cannot access this Resource" });
   }
   
   let id = req.client ? req.client._id : req.freelancer._id;
    id = req.freelancer ? req.freelancer._id : req.client._id;

   let doc1 =   await Client.findOne({ _id :id });
   let doc2 =   await Freelancer.findOne({ _id :id });

   if (!doc1 && !doc2) {
    return res.status(403).json({ errorMessage: "Unauthorized" });
   }

  
  const {name , email ,card_Name,card_ExpYear,card_ExpMonth,card_Number,card_CVC} = req.body;

  if(!name || !email || !card_Name || !card_ExpYear || !card_ExpMonth || !card_Number  || !card_CVC){
    return res.status.json('please add all the Required field')
  }

  try {
    const customer = await stripe.customers.create({
      name: name,
      email: email,
    });

    if(customer){
      const card_Token = await stripe.tokens.create({
        card: {
          name: card_Name,
          number: card_Number,
          exp_month: card_ExpMonth,
          exp_year: card_ExpYear,
          cvc: card_CVC,
        },
      });

      if(!card_Token){
        res.status(400).json('Error While adding Card')
      }

      const card = await stripe.customers.createSource(customer.id, {
        source: `${card_Token.id}`,
      });

      const cardDetails= await  paymentModel.create({
        CardDetails : {
          name : name ,
          email : email,
          customerId : customer.id ,
          cardId : card.id
        },
        userId : id
      })

      if(!cardDetails){
        res.status(400).json('Error while adding to database')
      }


      res.status(201).json(cardDetails)

    }  
   
  } catch (error) {
    throw new Error(error);
  }
})

  