import {ATypes} from "../actions/types";

export default function (state = false, action) {
    switch (action.type) {
        case ATypes.SHOW_MAKE_GROUP_DIALOGUE:
        case ATypes.HIDE_MAKE_GROUP_DIALOGUE:
            return action.payload;
            break;

    }
    return state;
}
