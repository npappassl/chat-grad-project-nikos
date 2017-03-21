"use strict";

const status = {
    "ok":200,
    "created":201,
    "notFound":404
};

function checkStatusOK(response) {
    if (response.status === status.ok) {
        return response;
    } else {
        var err = new Error(response.statusText);
        err.response = response;
        throw err;
    }
}


export const parseJSON = function(response,dispatch,next) {
    if(response.status === 401 || response.status === 404) {
        console.log("server gave", response.status, "\nmessage:", response.statusText);
        return next(null);
    }
    if(next !== null) {
        return next(dispatch, response.response);
    }
};
