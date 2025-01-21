const express = require('express');
const app = express();
const exhbs=require('express-handlebars')
const path=require('path')
const mongoose=require('mongoose')
require('dotenv').config()
const session=require('express-session')
const moment=require('moment')

app.use(express.urlencoded({extended:false}))
const connect = mongoose.connect(process.env.MONGO_URL);
connect.then(() => {
    console.log('db connected');
}).catch(() => {
    console.log('db not connected');
});

const setupsocketServer=require('./config.js')
const server=setupsocketServer(app)
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 36000000 }
}));

const hbs = exhbs.create({
    extname: 'hbs',
    helpers: {
        inc: function(value) {
            return parseInt(value) + 1;
        },
        lt: (a, b) => a < b,
        eq: (a, b) => a === b,
        not: (value) => !value,
        and: (a, b) => a && b,
        pq: (a, b) => {
            if (a == null || b == null) {
                return false;
            }
            return a.toString() === b.toString();
        },
        add:(a,b)=>a+b,
        formatDate: function(date,format) {
            return moment(date).format(format);
        },
        tolowercase:(str)=>{
            return str.toLowerCase()
        }

    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});


app.engine('hbs',hbs.engine)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));




const appRoute = require('./routes/users/user'); 
app.use('/', appRoute);  





const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
