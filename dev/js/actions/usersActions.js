import UsersApi from "../api/usersApi";
import {ATypes} from "./types";

export const sendUsersRequest = function() {
    console.log("sendUsersRequest");
    return function(dispatch){
        return UsersApi.getUsers()
        .then(users => {
            let userList = [];
            let groups = [];
            users.users.map((a) => {
                if(a.group){
                    groups.push(a);
                } else {
                    userList.push(a);
                }
            });
            dispatch(loadUsersSuccess({
                users:userList,groups:groups,onlineUsers:users.onlineUsers
            }));
        })
        .catch( function(error) {
            throw (error);
        });
    };

};

export const sendConversationsRequest = function(user) {
    console.log("sendConversationsRequest");
    return function(dispatch){
        return UsersApi.getConversations(user)
        .then(users => {
            console.log(users);
            dispatch(loadConversationsSuccess(users));
        })
        .catch( function(error) {
            throw (error);
        });
    };

};
export const sendUpdateUserDetailsRequest = function(user) {
    return function(dispatch) {
        return null;
    }
}
export const openEditUserDialogue = function() {
    return function (dispatch) {
            dispatch(showEditUserDialogue());
    }
}
export const closeEditUserDialogue = function() {
    return function (dispatch) {
            dispatch(hideEditUserDialogue());
    }
}

export const sendDeleteConversationMessagesRequest = function(conversationId) {
    return function(dispatch) {
        return UsersApi.deleteConversationMessages(conversationId)
        .then(response => {
            console.log(response);
        })
    }
}
export const sendReadConversationRequest = function(conversationId, userId) {
    return function(dispatch) {
        return UsersApi.postReadConversation(conversationId, userId)
        .then(response => {
            console.log(response);
        });
    };
};
export const sendConversationDetailRequest = function(conversationId) {
    console.log("sendConversationsRequest");
    return function(dispatch){
        return UsersApi.getConversationDetail(conversationId)
        .then(users => {
            console.log(users);
            dispatch(loadConversationDetailSuccess(users));
        })
        .catch( function(error) {
            throw (error);
        });
    };

};

// const loadReadConversations = function(conversationId, userId){
//     return {
//         ATypes.GOT_READ_CONVERSATIONS,
//         payload: {
//             conv: conversationId,
//             user: userId
//         }
//     }
// }

const loadUsersSuccess = function(users) {
    console.log("users", users);
        return {
            type: ATypes.GOT_USERS,
            payload: users
        };
};

const loadConversationsSuccess = function(conversations) {
    console.log("conversations", conversations);
        return {
            type: ATypes.GOT_CONVERSATIONS,
            payload: conversations
        };
};
const loadConversationDetailSuccess = function(conversations) {
    console.log("conversations", conversations);
        return {
            type: ATypes.GOT_CONVERSATION_DETAIL_SUCCESS,
            payload: conversations
        };
};
const hideEditUserDialogue = function() {
    return {
        type: ATypes.HIDE_EDIT_USER_DIALOGUE,
        payload: false
    }
}
const showEditUserDialogue = function() {
    return {
        type: ATypes.SHOW_EDIT_USER_DIALOGUE,
        payload: true
    }
}
