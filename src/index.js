const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { Socket } = require('dgram')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')



const app = express()
const server = http.createServer(app)// creates http raw server
const io = socketio(server) //socket.io expects http raw server

const port = process.env.PORT || 3000
//Define paths for Express config
const publicDir = path.join(__dirname, '../public')

//Setup static directory to server 

app.use(express.static(publicDir))



io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    //Joins client to a room with username
    socket.on('join', ({ username , room }, callback) => {
        const  { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error) //stop the function execution and call callback error
        }
        socket.join(user.room)
        
        //Sends to just this socket/client
        socket.emit('message', generateMessage('Admin', 'Welcome!'))

        //Sends to everybody except this particular socket/client
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined ${room}!`)) 
        //Send user list to everyone
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    //Server receives a socket's/client's message
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)
        //Filters profanity
        if(filter.isProfane(message)) {
            return callback('Profanity not allowed!')
        }

        //Server outputs to other socktes/clients
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords,callback) => { //Callback added on to allow acknowledgement
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))

        callback()
    })

    //Socket or client disconnects
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})

// Deprecated

//server (emit) -> client (receive) - countUpdated --acknowledgment--> server
//client (emit) -> server (receive) - increment --acknowledgement--> client
// let count = 0
// io.on('connection', (socket) => {
//     console.log('New WebSocket connection')

//     socket.emit('countUpdated', count)

//     socket.on('increment', () => {
//         count++
//         //socket.emit('countUpdated', count) //Emits to specific connection
//         io.emit('countUpdated', count) //Emits to every connection
//     })
// })
