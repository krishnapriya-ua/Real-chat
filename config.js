
const express = require('express');
const app = express();
require('dotenv').config()
const session=require('express-session')
const socketIo=require('socket.io')
const http=require('http')
const User=require('./model/user')
const Message=require('./model/message')

module.exports=(app)=>{
    const server = http.createServer(app);
    const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) {
       
        User.findByIdAndUpdate(userId, { status: 'online' }).catch(console.error);
        socket.join(userId); 

      
        io.emit('user status', { userId, status: 'online' });
    }

    
    socket.on('chat message', async (msg) => {
        try {
            const message = new Message({
                text: msg.text,
                sender: msg.sender,
                receiver: msg.receiver,
                connectionId:msg.sender + '-' + msg.receiver
            });

            await message.save(); 

            
           
            io.to(msg.receiver).emit('chat message', msg);
            
            if (msg.sender !== msg.receiver) {
                io.to(msg.sender).emit('chat message', msg);
            }
        } catch (error) {
            console.log('Error saving message:', error);
        }
    });

   
    socket.on('disconnect', async () => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            await User.findByIdAndUpdate(userId, { status: 'offline' });
            io.emit('user status', { userId, status: 'offline' });
        }
        console.log('user disconnected');
    });
});
return server;
}