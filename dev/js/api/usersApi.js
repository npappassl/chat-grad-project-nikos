export default class UsersApi{
    static getUsers() {
        const request = new Request("/api/users", {
            method: 'GET',
            credentials: 'include'
        });

        return fetch(request).then(response => {
            return response.json();
        }).catch(error => {
            return error;
        });
    }
    // const loadURISuccess = function(uri) {
    //         return {
    //             type: ATypes.GOT_URI,
    //             payload: uri.uri
    //         };
    // };
}
