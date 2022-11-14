const NotificationModel = require('../models/notficationsModel')

module.exports.saveNotifcation = (sendFrom, sendTo, id, title, context) => {
  
    return new Promise( async (resolve , reject) =>{
        const notification = await  NotificationModel.create({
            sendfrom: sendFrom,
            sendto: sendTo,
            id : id,
            title: title,
            context: context
        })
        if(notification){
            resolve(notification)
        }else{
            reject()
        }
})
   

}