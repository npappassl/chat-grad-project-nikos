export default class LoginApi{
    static getUri() {
        const request = new Request("/api/oauth/uri", {
            method: 'GET',
            credentials: 'include'
        });

        return fetch(request).then(response => {
            return response.json();
        }).catch(error => {
            return error;
        });
    }

    static getSession() {
        const request = new Request("/api/user", {
            method: 'GET',
            credentials: 'include'
        });

        return fetch(request).then(response => {
            return response.json();
        }).catch(error => {
            return error;
        });

     }

}
