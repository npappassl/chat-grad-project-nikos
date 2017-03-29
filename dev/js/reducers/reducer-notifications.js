import {ATypes} from "../actions/types";

export default function(state = null, action) {
    switch (action.type) {
        case ATypes.GOT_NOTIFICATIONS:
            return action.payload;
            break;
        default:
            return state;
    }

}
