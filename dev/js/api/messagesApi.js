export default class MessagesApi{
    static getAllMessages() {
        const request = new Request("/api/messages", {
            method: 'GET',
            credentials: 'include'
        });

        return fetch(request).then(response => {
            return response.json();
        }).catch(error => {
            return error;
        });
     }

     static getMessages(user) {
         const request = new Request("/api/messages/" + user._id, {
             method: 'GET',
             credentials: 'include',
         });

         return fetch(request).then(response => {
             return response.json();
         }).catch(error => {
             return error;
         });
      }


     static sendMessage(obj,callback,callbackArg){
         const request = new Request("/api/message", {
             method: 'POST',
             headers: {
                "Content-type": "application/json"
             },
             body: JSON.stringify(obj),
             credentials: 'include'
         });

        return fetch(request).then(response => {
            callback(callbackArg);
            return response.json();
        }).catch(error => {
            return error;
        });
     }
}
