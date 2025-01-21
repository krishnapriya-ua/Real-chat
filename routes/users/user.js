const express = require('express');
const router = express.Router();
const usercontroller=require('../../controllers/usercontroller')
const Message=require('../../model/message')
const User=require('../../model/user')

const redirectIfLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
};


const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

router.get('/login',redirectIfLoggedIn,usercontroller.getlogin ) 

router.post('/login',redirectIfLoggedIn, usercontroller.postlogin);

router.get('/signup',usercontroller.getsignup);

router.post('/signup', usercontroller.postsignup);

router.get('/',requireLogin,usercontroller.gethomepage)

router.get('/chat/:userid',usercontroller.chatcontroller)

router.get('/logout',usercontroller.logout)

router.get('/searchuser',usercontroller.searchuser)


module.exports = router;  
