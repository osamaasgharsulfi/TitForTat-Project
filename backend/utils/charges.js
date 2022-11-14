const {
    promises
} = require('nodemailer/lib/xoauth2');
const Stripe = require('stripe')
const stripe = process.env.stripeKey;


module.exports.createCharges = (email, price, customer_Id, card_ID) => {
    try {
        return new Promise(async (resolve, reject) => {

            const Price = await getResults(price);
            const createCharge = await stripe.charges.create({
                receipt_email: email,
                amount: Price, //USD*100
                currency: "usd",
                card: card_ID,
                customer: customer_Id,
            });

            if (createCharge) {
                resolve(createCharge)
            } else {
                reject(createCharge)
            }
        })
    } catch (error) {
        console.log(error)
        throw error
    }

}

async function getResults(price) {
    const axios = require('axios');
    var amount = 0;
    await axios.get('https://api.exchangerate-api.com/v4/latest/USD')
        .then(currency => {
            amount = (price / currency.data.rates.PKR)
            amount = amount.toFixed(2)
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
    return amount;
}