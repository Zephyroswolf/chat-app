const users = []
//Adds user to the chatroom
const addUser = ({id, username, room}) => {
    //Clean the data
    username= username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    //Validate the data
    if(!room | !username) {
        return {
            error: 'Username and room are required!'
        }
    }

    //Check for existing users
    const existingUsers = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate Username
    if(existingUsers){
        return {
            error: 'Username already in use!'
        }
    }

    //Store User
    const user = { id, username, room}
    users.push(user)
    return { user }
}
//Remove User from chat
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}
//Retrieves User by ID
const getUser = (id) => {
    return users.find((user) => user.id === id)
}
//Lists users in chatroom
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}