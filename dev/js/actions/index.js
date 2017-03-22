import {parseJSON} from "../util/serverAux";
import {ATypes} from "./types";

export const selectUser = (user) => {
    console.log("You clicked on user: ", user.id);
    return {
        type: ATypes.USER_SELECTED,
        payload: user
    };
};

// const sendRequest = function(method,url,dispatch,next,obj) {
//     try {
//         var oReq = new XMLHttpRequest();
//         oReq.responseType="json";
//         oReq.addEventListener("load", function(){
//             return reqListener(oReq,dispatch,next);
//         });
//         if(obj && method === "POST"){
//             oReq.open(method, url,true);
//             oReq.setRequestHeader("Content-type", "application/json");
//             console.log(JSON.stringify(obj));
//             oReq.send(JSON.stringify(obj));
//         } else{
//             oReq.open(method,url);
//             oReq.send();
//         }
//     } catch (err) {
//         console.log(err);
//     }
//
// };
// function reqListener(response,dispatch,next) {
//     return parseJSON(response,dispatch,next);
// }
