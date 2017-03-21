import LoginApi from "../api/LoginApi";
import {ATypes} from "./types";

export const sendAuthUriRequest = function() {
    console.log("sendAuthUriRequest");
    return function(dispatch){
        return LoginApi.getUri()
        .then(uri => {
            console.log(uri);
            console.log(dispatch);
            dispatch(loadURISuccess(uri));
        }).catch( function(error) {
            throw (error);
        });
    };
    // sendRequest("GET","api/oauth/uri",dispatch,setAuthenticationUriInProps);
};
export const sendSesionRequest = function() {
    console.log("this is sendSession request");
    return function (dispatch) {
        return LoginApi.getSession()
        .then(session => {
            console.log(session);
            console.log(dispatch);
            dispatch(loadSessionSuccess(session));
        }).catch( function(error) {
            throw (error);
        });
    };
    // sendRequest("GET","api/user",dispatch,setSessionInProps);
};
const loadURISuccess = function(uri) {
        return {
            type: ATypes.GOT_URI,
            payload: uri.uri
        };
};

const loadSessionSuccess = function(session) {
    console.log(session);
        return {
            type: ATypes.GOT_SESION,
            payload: session
        };
};
