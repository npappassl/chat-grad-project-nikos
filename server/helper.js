//-------------------  My auxiliary functions  GLOBAL --------------------------
module.exports  =  {
    notifyAll: function (sessionList) {
        for (let i in sessionList) {
            if (sessionList[i].socket) {
                sessionList[i].socket.send(JSON.stringify(new Date()), function() {  });
            }
        }
    },
    notifyUser: function (userId, sessionList, type) {
        const message = type;
        for (let i in sessionList) {
            if (sessionList[i].user === userId) {
                if (sessionList[i].socket) {
                    console.log(userId, "notified");
                    sessionList[i].socket.send(JSON.stringify(message || "all"), function() {  });
                    break;
                }
            }
        }
    },
    parseCookie: function(cookie) {
        if (cookie) {
            let cookies = {};
            cookie.split(";").map(function(coockieLine) {
                const parsedCoockie = coockieLine.trim().split("=");
                cookies[parsedCoockie[0]] = parsedCoockie[1];
            });
            console.log(cookies.sessionToken);
            return cookies.sessionToken;
        } else {
            return null;
        }
    }
};
