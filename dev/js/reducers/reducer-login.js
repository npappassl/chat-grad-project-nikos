import {GOT_SESION} from "../actions/types";

export default function (state = false, action) {
    switch (action.type) {
        case GOT_SESION:
            return action.payload;
            break;
    }
    return state;
}
