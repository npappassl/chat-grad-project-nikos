//-------------------  My auxiliary functions  GLOBAL --------------------------
module.exports  =  {
    notifyAll: function (sessionList) {
        for (let i in sessionList) {
            if (sessionList[i].socket) {
                sessionList[i].socket.send(JSON.stringify(new Date()), function() {  });
            }
        }
    },
    notifyUser: function (userId, sessionList) {
        for (let i in sessionList) {
            if (sessionList[i].user === userId) {
                if (sessionList[i].socket) {
                    sessionList[i].socket.send(JSON.stringify(new Date()), function() {  });
                    break;
                }
            }
        }
    }
};
