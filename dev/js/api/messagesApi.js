export default class MessagesApi{
     static sendMessage(obj){
         const request = new Request("/api/message", {
             method: 'POST',
             headers: {
                "Content-type": "application/json"
             },
             body: JSON.stringify(obj),
             credentials: 'include'
         });

        return fetch(request).then(response => {
            return response.json();
        }).catch(error => {
            return error;
        });
     }
}
