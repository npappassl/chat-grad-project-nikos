import serverAux from "../util/serverAux"
import {connect} from 'react-redux';
import fetch from 'isomorphic-fetch';

export default function (state = null, action) {
    console.log(action);
    fetch("/api/user")
    fetch("/api/oauth/uri",{method:"GET"})
        .then(serverAux.checkStatusOK)
        .then(serverAux.parseJSON)
        .then(function(response){
            console.log(response);
            return response.uri;
        }).catch(function(err){
            console.log(err);
        });
        return state;
}
