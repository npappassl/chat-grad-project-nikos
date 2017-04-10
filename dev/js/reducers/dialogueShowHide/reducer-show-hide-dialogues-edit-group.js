import {ATypes} from "../../actions/types";

export default function (state = false, action) {
    switch (action.type) {
        case ATypes.SHOW_EDIT_GROUP_DIALOGUE:
        case ATypes.HIDE_EDIT_GROUP_DIALOGUE:
            return action.payload;
            break;

    }
    return state;
}
