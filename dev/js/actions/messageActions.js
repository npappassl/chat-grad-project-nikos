import MessagesApi from "../api/messagesApi";
import {ATypes} from "./types";

export const loadMessages = function() {
    console.log("loadMessages");
    return function(dispatch) {
        console.log("dis",dispatch);
        return MessagesApi.getAllMessages().then(messages =>{
                dispatch(()=>{
                    return {
                        type: ATypes.GOT_MESSAGES,
                        payload: messages
                    }
                });
        }).catch(error => {
            throw(error);
        });
    };
}
export const sendMessagesRequest = function (dispatch){
    console.log("send Messages requet");

    sendRequest("GET","api/messages",dispatch,setMessagesInProps);
}
