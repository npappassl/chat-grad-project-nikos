import {ATypes} from "../actions/types";

export default function (state = false, action) {
    switch (action.type) {
        case ATypes.GOT_SESION_LOADING:
            return "loading";
            break;
        case ATypes.GOT_SESION_ERROR:
            return false;
            break;
        case ATypes.GOT_SESION_SUCCESS:
            return action.payload;
            break;
    }
    return state;
}
