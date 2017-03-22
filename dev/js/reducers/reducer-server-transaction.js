import {ATypes} from "../actions/types";

export default function (state = "", action) {
    switch (action.type) {
        case ATypes.SERVER_TRANSACTION_TIMESTAMP:
            return action.payload;
            // break;
    }
    return state;
}
