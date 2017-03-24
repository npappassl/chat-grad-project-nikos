import UsersApi from "../api/usersApi";
import {ATypes} from "./types";

export const sendUsersRequest = function() {
    console.log("sendUsersRequest");
    return function(dispatch){
        return UsersApi.getUsers()
        .then(users => {
            console.log(users);
            dispatch(loadUsersSuccess(users));
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

export const sendConversationDetailRequest = function(user) {
    console.log("sendConversationsRequest");
    return function(dispatch){
        return UsersApi.getConversationDetail(user)
        .then(users => {
            console.log(users);
            dispatch(loadConversationDetailSuccess(users));
        })
        .catch( function(error) {
            throw (error);
        });
    };

};

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
