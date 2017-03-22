import {ATypes} from "../actions/types";

export default function (state = "", action) {
    switch (action.type) {
        case ATypes.SEARCH_FILTER_CHANGED:
            return action.payload;
            // break;
    }
    return state;
}
