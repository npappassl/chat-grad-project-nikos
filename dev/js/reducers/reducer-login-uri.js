import serverAux from "../util/serverAux"
import {connect} from 'react-redux';
import fetch from 'isomorphic-fetch';
import {GOT_URI} from "../actions/types";

export default function (state = null, action) {
    switch (action.type) {
        case GOT_URI:
            return action.payload;
            break;
    }
    return state;
}
