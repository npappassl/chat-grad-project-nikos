import {ATypes} from "../actions/types";

export default function (state = [], action) {
    switch (action.type) {
        case ATypes.GOT_USERS:
            return action.payload;
            break;
    }
    return state;
}
