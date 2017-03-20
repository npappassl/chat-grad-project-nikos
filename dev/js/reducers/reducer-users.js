import {ATypes} from "../actions/types";

export default function (state = [], action) {
    switch (action.type) {
        case ATypes.GOT_USERS:
            return action.payload;
            break;
    }
    if (state.length === 0){
        return [
            {avatarUrl:"https://cdn.pixabay.com/photo/2016/03/28/12/35/cat-1285634_960_720.png",
            id:"nick",
            name: "nikos"},
            {avatarUrl:"https://cdn.pixabay.com/photo/2016/03/28/12/35/cat-1285634_960_720.png",
            id:"nio",
            name: "nikolaos"},
        ];
    }
    return state;
}
