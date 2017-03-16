import {parseJSON} from "../util/serverAux";
import {ATypes} from "./types";
// --------------------------- AUX ---------------------------------
export const selectUser = (user) => {                              //
    console.log("You clicked on user: ", user.first);               //
    return {
        type: USER_SELECTED,
        payload: user
    }
};                                                                  //
// --------------------------- AUX ---------------------------------


export const sendUsersRequest = function(dispatch){
    sendRequest("GET","api/users",dispatch,setUsersInProps);
}
export const sendAuthUriRequest = function(dispatch){
    sendRequest("GET","api/oauth/uri",dispatch,setAuthenticationUriInProps);
}
export const sendSesionRequest = function(dispatch){
    sendRequest("GET","api/user",dispatch,setSessionInProps);
}

const setInProps = (dispatch,type,payload) => {
    dispatch({
        type: type,
        payload: payload
    });
}
const setAuthenticationUriInProps = (dispatch,response) => {
    return setInProps(dispatch,ATypes.GOT_URI, response.uri);
};
const setSessionInProps = (dispatch,response) => {
    return setInProps(dispatch,ATypes.GOT_SESION, response);
};
const setUsersInProps = (dispatch,response) => {
    return setInProps(dispatch,ATypes.GOT_USERS, response);
};

const sendRequest = function(method,url,dispatch,next) {
    try {
        var oReq = new XMLHttpRequest();
        oReq.responseType="json";
        oReq.addEventListener("load", function(){
            reqListener(oReq,dispatch,next);
        });
        oReq.open(method, url);
        oReq.send();
    } catch (err) {
        console.log(err);
    }

}


function reqListener(response,dispatch,next) {
    parseJSON(response,dispatch,next);
}
