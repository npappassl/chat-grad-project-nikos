import serverAux from "../util/serverAux";
import {GOT_URI, USER_SELECTED, GOT_SESION} from "./types";
import fetch from "isomorphic-fetch";

export const selectUser = (user) => {
    console.log("You clicked on user: ", user.first);
    return {
        type: USER_SELECTED,
        payload: user
    }
};

const setAuthenticationUriInProps = (response) => {
    console.log("the uri is: " + response.split("\"")[3]);
    return {
        type: GOT_URI,
        payload: response.split("\"")[3]
    }
};

const setSessionInProps = (response) => {
    console.log("the user is: " + response);
    return {
        type: GOT_SESION,
        payload: response
    }
};


export const sendSesionRequest = function(dispatch){
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function(){
        reqListener(oReq,dispatch,setSessionInProps);
    });
    oReq.open("GET", "api/user");
    oReq.send();
}

export const sendAuthUriRequest = function(dispatch){
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function(){
        reqListener(oReq,dispatch,setAuthenticationUriInProps);
    });
    oReq.open("GET", "api/oauth/uri");
    oReq.send();
}

function reqListener (response,dispatch,next) {
    console.log("reqListener",response.response);
    dispatch((function(){
            console.log("dispatching");
            return next(response.response);
        })()
    );
}
