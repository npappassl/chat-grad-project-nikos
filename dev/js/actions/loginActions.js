import LoginApi from "../api/LoginApi";
import {ATypes} from "./types";

export const sendAuthUriRequest = function() {
    console.log("sendAuthUriRequest");
    return function(dispatch){
        return LoginApi.getUri()
        .then(uri => {
            dispatch(loadURISuccess(uri));
        }).catch( function(error) {
            throw (error);
        });
    };
};
export const sendSesionRequest = function(reload) {
    console.log("this is sendSession request");
    return function (dispatch) {
        if(reload) {
            dispatch(loadSessionReLoading());

        }else {
            dispatch(loadSessionLoading());
        }
        return LoginApi.getSession()
        .then(session => {
            dispatch(loadSessionSuccess(session));
        }).catch( function(error) {
            throw (error);
        });
    };
};
const loadURISuccess = function(uri) {
        return {
            type: ATypes.GOT_URI,
            payload: uri.uri
        };
};

const loadSessionSuccess = function(session) {
        return {
            type: ATypes.GOT_SESION_SUCCESS,
            payload: session
        };
};
const loadSessionLoading = function() {
        return {
            type: ATypes.GOT_SESION_LOADING,
        };
};

const loadSessionReLoading = function() {
        return {
            type: ATypes.GOT_SESION_RELOADING,
        };
};
