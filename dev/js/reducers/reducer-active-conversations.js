import {ATypes} from "../actions/types";

export default function (state = null, action) {
    switch (action.type) {
        case ATypes.CONVERSATION_CREATED:
        case ATypes.CONVERSATION_SELECTED:
            return action.payload;
            break;
    }
    return state;
}
