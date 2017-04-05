import {ATypes} from "./types";
import UsersApi from "../api/usersApi"

export const openMakeGroupDialogue = function() {
    return function (dispatch) {
            dispatch(showMakeGroupDialogue());
    }
}
export const closeMakeGroupDialogue = function() {
    return function (dispatch) {
            dispatch(hideMakeGroupDialogue());
    }
}
export const openEditGroupDialogue = function() {
    return function (dispatch) {
            dispatch(showEditGroupDialogue());
    }
}
export const closeEditGroupDialogue = function() {
    return function (dispatch) {
            dispatch(hideEditGroupDialogue());
    }
}

export const sendNewGroupRequest = function(group, avatar, participants, creator) {
    return function (dispatch) {
        return UsersApi.sendMakeNewGroupRequest(group, avatar, participants, creator);
    }
}
const hideMakeGroupDialogue = function() {
    return {
        type: ATypes.HIDE_MAKE_GROUP_DIALOGUE,
        payload: false
    }
}
const showMakeGroupDialogue = function() {
    return {
        type: ATypes.SHOW_MAKE_GROUP_DIALOGUE,
        payload: true
    }
}
const hideEditGroupDialogue = function() {
    return {
        type: ATypes.HIDE_EDIT_GROUP_DIALOGUE,
        payload: false
    }
}
const showEditGroupDialogue = function() {
    return {
        type: ATypes.SHOW_EDIT_GROUP_DIALOGUE,
        payload: true
    }
}
