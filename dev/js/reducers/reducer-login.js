import {ATypes} from "../actions/types";

export default function (state = false, action) {
    switch (action.type) {
        case ATypes.GOT_SESSION_LOADING:
            return "loading";
            break;
        case ATypes.GOT_SESSION_RELOADING:
            return state;
            break;
        case ATypes.GOT_SESSION_ERROR:
            return false;
            break;
        case ATypes.GOT_SESSION_SUCCESS:
            return action.payload;
            break;
    }
    return state;
}
