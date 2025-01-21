const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    phonenumber: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
   
    createdAt:{
        type:Date,
        default:Date.now()
    },
    status:{
        type:String,
        enum:['online','offline'],
        default:'offline'
    },
   

   

},{timestamps:true});




const User = mongoose.model('User', userSchema);

module.exports = User;
