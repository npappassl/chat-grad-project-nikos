import {ATypes} from "../actions/types";
export default function (state = [], action) {
    switch (action.type) {
        case ATypes.GOT_CONVERSATION_DETAIL_SUCCESS:
            return action.payload;
            break;
    }
    return state;
}
