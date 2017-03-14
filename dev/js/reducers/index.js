import {combineReducers} from 'redux';
import UserReducer from './reducer-users';
import ActiveUserReducer from './reducer-active-user';
import Messages from './reducer-messages'
import loginReducer from './reducer-login'
import loginUriReducer from './reducer-login-uri'
/*
 * We combine all reducers into a single object before updated data is dispatched (sent) to store
 * Your entire applications state (store) is just whatever gets returned from all your reducers
 * */

const allReducers = combineReducers({
    loginUri: loginUriReducer,
    users: UserReducer,
    activeUser: ActiveUserReducer,
    login: loginReducer,
    messages: Messages
});

export default allReducers
