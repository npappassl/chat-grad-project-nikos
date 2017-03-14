const status = {
    "ok":200,
    "created":201,
    "notFound":404
}

function checkStatusOK(response) {
    if (response.status === status.ok) {
        return response;
    } else {
        var err = new Error(response.statusText);
        err.response = response;
        throw err;
    }
}

function parseJSON(response) {
    return response.json();
}
