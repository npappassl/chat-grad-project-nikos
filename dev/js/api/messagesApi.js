export default class MessagesApi{
    static getAllMessages() {
    // const headers = this.requestHeaders();
    // const request = new Request(`${process.env.API_HOST}/api/v1/cats`, {
    const request = new Request("/api/messages", {
      method: 'GET',
    //   headers: headers
    });

    return fetch(request).then(response => {
         return response.json();
       }).catch(error => {
         return error;
       });
     }

}
