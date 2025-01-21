const express = require('express');
const router = express.Router();
const session=require('express-session')
const User=require('../model/user')
const mongoose=require('mongoose')
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const bcrypt=require('bcrypt');
const Message = require('../model/message');
const passport=require('passport')



module.exports={


 getlogin:(req,res)=>{
    res.set('Cache-Control', 'no-store, private, must-revalidate');
    res.render('users/login')
},

 postlogin:async(req,res)=>{
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json('All fields are necessary');
        }
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json('Invalid username or password');
        }
        if (user.isblocked) {
            return res.status(400).json('Sorry, your account has been blocked');
        }
        req.session.user = user;
        await User.findByIdAndUpdate(user._id,{status:'online'})
        return res.json('Login successful');
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
},
getsignup:async(req,res)=>{
    res.set('Cache-Control', 'no-store, private, must-revalidate');
    res.render('users/signup');
},

postsignup:async(req,res)=>{
    const { fullname, username, phonenumber, email, password } = req.body;
    try {
        if (!fullname || !username || !phonenumber || !email || !password) {
            return res.status(400).json({ message: 'All fields are necessary' });
        }
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        const parsedphonenumber = parsePhoneNumberFromString(phonenumber);
        if (!parsedphonenumber || !parsedphonenumber.isValid()) {
            return res.status(400).json({ message: 'Invalid phone number' });
        }
       
      
        user = new User({
            fullname,
            username,
            email,
            phonenumber: parsedphonenumber.number,
            password: await bcrypt.hash(password, 10),
           
        });

        await user.save();

       
       return res.status(200).json({message:'signup successfull please login'})
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
},

gethomepage:async(req,res)=>{
    res.set('Cache-Control', 'no-store, private, must-revalidate');
   
    const fullname=req.session.user.fullname
    const currentuser=req.session.user._id
    const user=await User.find({_id:{$ne:currentuser}})
    
   
    res.render('users/homepage',{currentuser,user,fullname})
 },

chatcontroller:async(req,res)=>{
    const userid=req.params.userid
    const currentuserid=req.query.currentuser
    try {
        const messages=await Message.find({
            $or:[
                {sender:currentuserid,receiver:userid},
                {sender:userid,receiver:currentuserid}
            ]
        }).sort({createdAt:1})

        res.json({messages})
    } catch (error) {
        console.log('error fetching chat history',error)
        res.status(500).json({success:false,message:'error fetching data'})
    }
},
logout:async(req,res)=>{
    const userid=req.session.user
    await User.findByIdAndUpdate(userid,{status:'offline'})
    req.session.destroy((err)=>{
        if(err){
            return res.status(500).json('error in logout')
        }
        res.redirect('/login')
    })
},
searchuser:async(req,res)=>{
    try {
        const searchQuery=req.query.query
        const users=await User.find({fullname:{$regex:new RegExp(searchQuery,'i')}})
        res.json(users)
    } catch (error) {
        console.log('error searching users')
        res.status(500).send('server error')
    }
}

}