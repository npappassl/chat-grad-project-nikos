import {ATypes} from "./types";

export const selectUser = (user) => {
    console.log("You clicked on user: ", user.id);
    return {
        type: ATypes.USER_SELECTED,
        payload: user
    };
};
export const selectConversation = (conversationId) => {
    console.log("You clicked on conversation: ", conversationId);
    return {
        type: ATypes.CONVERSATION_SELECTED,
        payload: conversationId
    };
};
