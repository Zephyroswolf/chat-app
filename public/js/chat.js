const socket = io()

//Elements, $ refers to it being an element, # specifies it's ID
const $messageForm = document.querySelector('#message-form') 
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => { //Autoscrolls unless user is looking through the chat history
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height 
    const visibleHeight = $messages.offsetHeight

    //Height of message container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html //place the html above inside the sidebar
})
document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault() //Prevents webpage default behavior from refreshing
    //Disable form once submitted
    $messageFormButton.setAttribute('disabled', 'diabled')
    //const message = document.querySelector('message').value
    //OR more secure method 
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        //Enable Form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //Checks for error
        if(error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
    
    $locationButton.setAttribute('disabled','disabled')

    if(!navigator.geolocation) {
        return alert('Geolocation not supported by browaser.')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            if(error) {
                return console.log(error)
            }
            $locationButton.removeAttribute('disabled')

            console.log('Location shared!')
        })
    })


})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})

//Deprecated

// socket.on('countUpdated', (count) => {
//     console.log('the count has been updated', count)
// })

//Selects button in html, listens for it and outputs from client to the server
// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')
// })