import MessagesApi from "../api/messagesApi";
import {ATypes} from "./types";

export const loadMessages = function(user) {
    console.log("loadMessages");
    return function(dispatch) {
        console.log("dis",dispatch);
        // return MessagesApi.getAllMessages()
        return MessagesApi.getMessages(user)
            .then(messages =>{
                console.log(messages);
                dispatch(loadServerTransaction(messages.lastTrans));
                dispatch(loadMessagesSuccess(messages.messages));
        }).catch(error => {
            throw(error);
        });
    };
};

export const sendMessageRequest = function(obj){
    MessagesApi.sendMessage(obj);
}

const loadMessagesSuccess = function(messages) {
    return {
        type: ATypes.GOT_MESSAGES,
        payload: messages
    };
};

const loadServerTransaction = function(timestamp) {
    return {
        type: ATypes.SERVER_TRANSACTION_TIMESTAMP,
        payload: timestamp
    };
};
