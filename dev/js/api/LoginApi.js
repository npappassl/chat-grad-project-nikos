export default class LoginApi{
    static getUri() {
        // const headers = this.requestHeaders();
        // const request = new Request(`${process.env.API_HOST}/api/v1/cats`, {
        const request = new Request("/api/oauth/uri", {
            method: 'GET',
            //   headers: headers
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
        });

        return fetch(request).then(response => {
            return response.json();
        }).catch(error => {
            return error;
        });

     }
}
