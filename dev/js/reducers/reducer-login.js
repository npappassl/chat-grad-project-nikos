import {ATypes} from "../actions/types";

export default function (state = false, action) {
    switch (action.type) {
        case ATypes.GOT_SESION:
            return action.payload;
            break;
    }
    return state;
}
