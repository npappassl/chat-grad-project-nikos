import {ATypes} from "../actions/types";

export default function (state = "loading", action) {
    switch (action.type) {
        case ATypes.GOT_USERS:
            return action.payload;
            // break;
    }
    return state;
}
