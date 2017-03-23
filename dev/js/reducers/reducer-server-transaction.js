import {ATypes} from "../actions/types";

export default function (state = {}, action) {
    if(state.timestamp === action.payload){
        console.log(state,action);
        return {needToUpdate: false,
                timestamp: action.payload};
    }
    switch (action.type) {
        case ATypes.SERVER_TRANSACTION_TIMESTAMP:
            return {needToUpdate: true,
                    timestamp: action.payload};
    }
    return state;
}
