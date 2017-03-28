import {combineReducers} from "redux";
import UserReducer from "./reducer-users";
import ActiveUserReducer from "./reducer-active-user";
import messagesReducer from "./reducer-messages";
import loginReducer from "./reducer-login";
import loginUriReducer from "./reducer-login-uri";
import userFilterReducer from "./reducer-users-filter";
import conversationsReducer from "./reducer-conversations";
import activeConversationReducer from "./reducer-active-conversations"
/*
 * We combine all reducers into a single object before updated data is dispatched (sent) to store
 * Your entire applications state (store) is just whatever gets returned from all your reducers
 * */

const allReducers = combineReducers({
    users: UserReducer,
    activeUser: ActiveUserReducer,
    activeConversation: activeConversationReducer,
    session: loginReducer,
    loginUri: loginUriReducer,
    messages: messagesReducer,
    searchFilter: userFilterReducer,
    conversations: conversationsReducer
});

export default allReducers;
