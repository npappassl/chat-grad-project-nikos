import MessagesApi from "../api/messagesApi";
import {ATypes} from "./types";

export const loadMessages = function(user) {
    console.log("loadMessages");
    return function(dispatch) {
        console.log("dis",dispatch);
        // return MessagesApi.getAllMessages()
        return MessagesApi.getMessages(user)
            .then(messages =>{
                dispatch(loadMessagesSuccess(messages));
        }).catch(error => {
            throw(error);
        });
    };
};
const loadMessagesSuccess = function(messages) {
    return {
        type: ATypes.GOT_MESSAGES,
        payload: messages
    };
};

export const sendMessageRequest = function(obj){
    MessagesApi.sendMessage(obj);
}
