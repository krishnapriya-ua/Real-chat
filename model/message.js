const mongoose = require('mongoose');


const MessageSchema = new mongoose.Schema({
    sender:{
        type:mongoose.Schema.ObjectId,
        ref:'User'

    },
    receiver:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    text:String,
    createdAt:{
        type:Date,
        default:Date.now
    }

});




const Message = mongoose.model('message', MessageSchema);

module.exports = Message;
