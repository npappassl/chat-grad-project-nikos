import {ATypes} from "../actions/types";
export default function (state = [], action) {
    switch (action.type) {
        case ATypes.GOT_MESSAGES:
            return action.payload;
            break;
    }
    return state;
}
