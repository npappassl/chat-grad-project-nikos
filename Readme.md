# Application Structure

## components
### App.js
## containers
file | Class
---- | -----
login-screen.js | LoginScreen
message-text-area.js | MessageTextArea
messages-container.js | MessagesContainer
searchFilterInput.js | SearchFilterInput
user-list.js | UserList

## reducers

file | Class | state.property
---- | ----- | --------------
reducer-active-user | ActiveUserReducer | activeUser
reducer-login-uri | loginUriReducer | loginUri
reduser-login | loginReducer | session
reducer-users | usersReducer | users
reducer-messages | messagesReducer | messages
reducer-users-filter | userFilterReducer | searchFilter


## api

## WebSocket
    the WebSocket sends a message to the user when the user needs to update his store

### LoginApi.js
    getUri()

    getSession()

### MessagesApi.js
    getAllMessages()

    getMessages(user)

    sendMessage(obj,callback,callbackArg)

## UsersApi
    getUsers()
