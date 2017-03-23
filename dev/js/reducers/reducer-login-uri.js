import {ATypes} from "../actions/types";

export default function (state = null, action) {
    switch (action.type) {
        case ATypes.GOT_URI:
            return action.payload;
            break;
    }
    return state;
}
