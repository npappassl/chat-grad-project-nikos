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
    static postReadConversation(conversationId, userId) {
        const request = new Request("/api/user/"+conversationId+"/"+userId, {
            method: "PUT",
            credentials: "include"
        });
        return fetch(request).then(response => {
            return response.json();
        }).catch(error => {
            return error;
        });
     }
    static getConversations(user) {
        const request = new Request("/api/conversations/"+user, {
            method: "GET",
            credentials: "include"
        });

        return fetch(request).then(response => {
            return response.json();
        }).catch(error => {
            return error;
        });
    }

    static getConversationDetail(user) {
        const request = new Request("/api/conversation/"+user, {
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
