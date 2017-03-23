import MessagesApi from "../api/messagesApi";
import {ATypes} from "./types";

export const loadMessages = function(user) {
    console.log("loadMessages");
    return function(dispatch) {
        return MessagesApi.getMessages(user)
            .then(messages =>{
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
