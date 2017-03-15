import serverAux from "../util/serverAux";
import {GOT_URI, USER_SELECTED} from "./types";

export const selectUser = (user) => {
    console.log("You clicked on user: ", user.first);
    return {
        type: USER_SELECTED,
        payload: user
    }
};

export const getAuthenticationUri = (response) => {
    console.log("the uri is: " + response);
    return {
        type: GOT_URI,
        payload: response
    }
};

function reqListener (response) {
    console.log(this.responseText);
    getAuthenticationUri(this.responseText.split("\"")[3]);
}
export const sendAuthUriRequest = function(){
    console.log(a);
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "api/oauth/uri");
    oReq.send();
    // fetch("/api/oauth/uri",{method:"GET"})
    //     .then(function(response){
    //         console.log(response);
    //         getAuthenticationUri(response);
    //         // response.resolve = function(response){
    //         //     getAuthenticationUri(response.uri);
    //         // }
    //
    //     // return response.uri;
    // }).catch(function(err){
    //     console.log(err);
    // });
}
