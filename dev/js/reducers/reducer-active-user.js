import {ATypes} from "../actions/types";
/*
 * All reducers get two parameters passed in, state and action that occurred
 *       > state isn't entire apps state, only the part of state that this reducer is responsible for
 * */

// "state = null" is set so that we don't throw an error when app first boots up
export default function (state = null, action) {
    console.log(action);
    switch (action.type) {
        case ATypes.USER_SELECTED:
            console.log(action.payload);
            return action.payload;
            break;
    }
    return state;
}
