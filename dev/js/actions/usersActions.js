import UsersApi from "../api/usersApi";
import {ATypes} from "./types";

export const sendUsersRequest = function() {
    console.log("sendUsersRequest");
    return function(dispatch){
        return UsersApi.getUsers()
        .then(users => {
            console.log(users);
            dispatch(loadUsersSuccess(users));
        })
        .catch( function(error) {
            throw (error);
        });
    };

};

const loadUsersSuccess = function(users) {
    console.log("users", users);
        return {
            type: ATypes.GOT_USERS,
            payload: users
        };
};
