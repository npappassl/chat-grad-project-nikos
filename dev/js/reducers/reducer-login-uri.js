import serverAux from "../util/serverAux"
import {connect} from 'react-redux';

export default function (state) {
    fetch("/api/oauth/uri",{method:"GET"})
        .then(serverAux.checkStatusOK)
        .then(serverAux.parseJSON)
        .then(function(response){
            state.loginUri = response.uri;
            return state;
        }).catch(function(err){
            console.log(err);
        });
        return null;
}
