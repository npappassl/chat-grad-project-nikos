import {parseJSON} from "../util/serverAux";
import {ATypes} from "./types";
// import dispatcher from "dispatcher";

export const selectUser = (user) => {
    console.log("You clicked on user: ", user.id);
    return {
        type: ATypes.USER_SELECTED,
        payload: user
    }
};

export const sendMessagesRequest = function (dispatch){
    sendRequest("GET","api/messages",dispatch,setMessagesInProps);
}
export const sendUsersRequest = function(dispatch){
    // return itemsFetchData("api/users",setUsersInProps);
    // return fetch("api/users",{method:"GET"});
    sendRequest("GET","api/users",dispatch,setUsersInProps);
}
export const sendAuthUriRequest = function(dispatch){
    sendRequest("GET","api/oauth/uri",dispatch,setAuthenticationUriInProps);
}
export const sendSesionRequest = function(dispatch){
    sendRequest("GET","api/user",dispatch,setSessionInProps);
}
export const sendMessageRequest = function(dispatch,obj){
    sendRequest("POST", "api/message",dispatch,null,obj);
}
const setInProps = (dispatch,type,payload) => {
    dispatch({
        type: type,
        payload: payload
    });
}
const setInPropsNoDisPatch = (type, payload) => {
    return {
        type: type,
        payload: payload
    };
}
const setMessagesInProps = function(dispatch,response) {
    setInProps(dispatch,ATypes.GOT_MESSAGES,response);
}
// const setSelectedUserInProps = function(dispatch,user){
//     setInProps(dispatch,ATypes.USER_SELECTED,user);
// }
const setAuthenticationUriInProps = (dispatch,response) => {
    return setInProps(dispatch,ATypes.GOT_URI, response.uri);
};
const setSessionInProps = (dispatch,response) => {
    setInProps(dispatch,ATypes.GOT_SESION, response);
};
const setUsersInProps = (dispatch,response) => {
    return setInProps(dispatch,ATypes.GOT_USERS, response);
};

const sendRequest = function(method,url,dispatch,next,obj) {
    try {
        var oReq = new XMLHttpRequest();
        oReq.responseType="json";
        oReq.addEventListener("load", function(){
            return reqListener(oReq,dispatch,next);
        });
        if(obj && method === "POST"){
            oReq.open(method, url,true);
            oReq.setRequestHeader("Content-type", "application/json");
            console.log(JSON.stringify(obj));
            oReq.send(JSON.stringify(obj));
        } else{
            oReq.open(method,url);
            oReq.send();
        }
    } catch (err) {
        console.log(err);
    }

}
const itemsFetchData = function (url,next) {
    return (dispatch) => {
        // dispatch(itemsIsLoading(true));
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                // dispatch(itemsIsLoading(false));
                return response;
            })
            .then((response) => response.json())
            .then((items) => dispatch(next(dispatch,items)));
            // .catch(() => dispatch(itemsHasErrored(true)));
    };
}
function reqListener(response,dispatch,next) {
    return parseJSON(response,dispatch,next);
}
