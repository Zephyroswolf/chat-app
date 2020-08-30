const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { Socket } = require('dgram')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')
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

    //Sends to just this socket/client
    socket.emit('message', generateMessage('Welcome!'))

    //Sends to everybody except this particular socket/client
    socket.broadcast.emit('message', 'New User has joined.') 

    //Server receives a socket's/client's message
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        //Filters profanity
        if(filter.isProfane(message)) {
            return callback('Profanity not allowed!')
        }
        //Server outputs to other socktes/clients
        io.emit('message', message)
        callback()
    })

    socket.on('sendLocation', (location,callback) => { //Callback added on to allow acknowledgement
        io.emit('locationMessage', `https://google.com/maps?q=${location.latitude},${location.longitude}`)
        
        callback()
    })

    //Socket or client disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left')
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
