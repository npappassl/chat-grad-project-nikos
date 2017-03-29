"use strict";
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const ObjectID = require("mongodb").ObjectID;
const http = require("http");
const WebSocketServer = require("ws").Server;

module.exports = function(port, db, githubAuthoriser, middleware) {
    let lastTransaction = Date.now();
    const app = express();

    for (let i in middleware) {
        app.use(middleware[i]);
    }
    app.use(bodyParser.json());
    app.use(cookieParser());

    app.use(express.static("public"));
    var users = db.collection("users");
    var conversations = db.collection("conversations");
    var sessions = {};

    app.get("/oauth", function(req, res) {
        githubAuthoriser.authorise(req, function(githubUser, token) {
            if (githubUser) {
                users.findOne({
                    _id: githubUser.login
                }, function(err, user) {
                    if (!user) {
                        // TODO: Wait for this operation to complete
                        users.insertOne({
                            _id: githubUser.login,
                            name: githubUser.name,
                            avatarUrl: githubUser.avatar_url,
                            group: false,
                            subscribedTo: [],
                            subscriptionRequests: []
                        });
                        lastTransaction = Date.now();
                        notifyAll(sessions);
                    }
                    sessions[token] = {
                        user: githubUser.login,
                    };
                    res.cookie("sessionToken", token);
                    res.header("Location", "/");
                    res.sendStatus(302);
                });
            }
            else {
                res.sendStatus(400);
            }

        });
    });

    app.get("/api/oauth/uri", function(req, res) {
        res.json({
            uri: githubAuthoriser.oAuthUri
        });
    });

    app.use(function(req, res, next) {
        if (req.cookies.sessionToken) {
            req.session = sessions[req.cookies.sessionToken];
            if (req.session) {
                next();
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(401);
        }
    });

    app.get("/api/user", function(req, res) {
        users.findOne({
            _id: req.session.user
        }, function(err, user) {
            if (!err) {
                res.status(200).json(user);
            } else {
                res.sendStatus(500);
            }
        });
    });
    app.get("/api/users", function(req, res) {
        users.find().toArray(function(err, docs) {
            if (!err) {
                res.status(200).json(docs.map(function(user) {
                    return {
                        id: user._id,
                        name: user.name,
                        avatarUrl: user.avatarUrl,
                    };
                }));
            } else {
                res.sendStatus(500);
            }
        });
    });

    app.get("/api/conversation/:conversationId", function(req, res) {
        console.log(req.params.conversationId);
        if (req.params.conversationId === null ||
            req.params.conversationId === undefined ||
            req.params.conversationId === "null" ||
            req.params.conversationId === "undefined") {
            return res.sendStatus(404);
        }
        conversations.findOne({_id: new ObjectID(req.params.conversationId)}, function(err, conversation) {
            if (!err) {
                console.log(conversation);
                res.status(200).json(conversation);
            } else {
                console.log(err.message);
                res.sendStatus(500);
            }
        });
    });
    app.get("/api/conversations/:userId", function(req, res) {
        console.log("req.params.userId", req.params.userId);
        lastTransaction = Date.now();
        if (!req.params.userId ||
            req.params.userId === "null" ||
            req.params.userId === "undefined"
        ) {
            res.sendStatus(404);
        } else {
            users.findOne({_id: req.params.userId}, function (err, user) {
                console.log("err", err);
                if (!err) {
                    conversations.find({_id: {$in: user.subscribedTo}}).toArray(function(errConv, data) {
                        console.log("errConv", errConv);
                        if (!errConv) {
                            let retVal = [];
                            for (var i in data) {
                                let participant = "";
                                if (req.params.userId === data[i].messages[0].userFrom) {
                                    participant = data[i].messages[0].userTo;
                                } else {
                                    participant = data[i].messages[0].userFrom;
                                }
                                retVal.push({
                                    id: data[i]._id,
                                    participant: participant,
                                    timestamp: data[i].messages[data[i].messages.length - 1].timestamp
                                });
                                console.log(retVal);
                            }
                            res.status(200).json(retVal);
                        } else {
                            console.log(errConv);
                            res.sendStatus(500);
                        }
                    });
                }else {
                    console.log(err);
                    res.sendStatus(500);
                }
            });
        }
    });
    app.post("/api/message", function(req, res) {
        lastTransaction = Date.now();
        let retConversationId = "";
        const tempMessage = {
            userFrom: req.body.userFrom,
            userTo:   req.body.userTo,
            msg:      req.body.msg,
            timestamp: Date.now()
        };
        if (!req.body.conversationId) {
            conversations.insertOne({
                messages: [tempMessage]
            }, function (err, data) {
                if (!err) {
                    retConversationId = data.insertedId;
                    addConversationToUser(req.body.userFrom, data.insertedId);
                    if (req.body.userFrom !== req.body.userTo) {
                        addConversationToUser(req.body.userTo, data.insertedId);
                    }
                    res.status(200).json(retConversationId);
                } else {
                    console.log(err);
                    res.sendStatus(500);
                }
            });
        } else {
            retConversationId = req.body.conversationId;
            conversations.findOne({_id: new ObjectID(retConversationId)}, function (err, conversation) {
                if (!err) {
                    conversation.messages.unshift(tempMessage);
                    conversations.updateOne({_id: new ObjectID(retConversationId)},
                        {$set: {messages: conversation.messages}}, function(errUpdate, data) {
                        if (!errUpdate) {
                            res.status(200).json(retConversationId);
                            notifyUser(req.body.userTo, sessions);
                            notifyUser(req.body.userFrom, sessions);
                        } else {
                            console.log(errUpdate);
                            res.sendStatus(500);
                        }
                    });
                } else {
                    console.log(err, "is an error");
                    res.sendStatus(500);
                }
            });
        }
    });

    //------------------------------ web socket server -------------------------
    const server = http.createServer(app);

    let wss = new WebSocketServer({server: server});
    console.log("websocket server created");
    // -------------- connection------------------------------------------------
    wss.on("connection", function connection(ws) {
        let sesToken;
        let cookie = ws.upgradeReq.headers.cookie;
        if (cookie) {
            sesToken = cookie.split("=")[1];
            console.log(sesToken);
            // console.log(sessions[sesToken]);
        }
        if (!sessions[sesToken]) {
            ws.close();
        } else {
            sessions[sesToken].socket = ws;
        }
        //
        // ws.send(JSON.stringify())
        var id = setTimeout(function() {
            // console.log(new Date(), sessions[sesToken].user);
            ws.send(JSON.stringify(new Date()), function() {  });
        }, 2000);

        console.log("websocket connection open:", sesToken);

        // -------------- close connection -------------------------------------
        ws.on("close", function() {
            if (sessions[sesToken]) {
                sessions[sesToken].socket = null;
            }
            console.log("websocket connection close:", sesToken);
            clearInterval(id);
        });
    });

    return server.listen(port);
    //-------------------  My auxiliary functions  LOCAL -----------------------
    function addConversationToUser(userId, conversationId) {
        users.findOne({_id: userId}, function(err, user) {
            if (!err) {
                user.subscribedTo.push(conversationId);
                users.updateOne({_id: userId},
                    {$set: {subscribedTo: user.subscribedTo}},
                    function(err, data) {
                        if (!err) {
                            notifyUser(userId, sessions);
                        } else {
                            console.log(err);
                        }
                    });
            }
        });
    }
};
//-------------------  My auxiliary functions  GLOBAL --------------------------
function notifyAll(sessionList) {
    for (let i in sessionList) {
        if (sessionList[i].socket) {
            sessionList[i].socket.send(JSON.stringify(new Date()), function() {  });
        }
    }
}
function notifyUser(userId, sessionList) {
    for (let i in sessionList) {
        if (sessionList[i].user === userId) {
            if (sessionList[i].socket) {
                sessionList[i].socket.send(JSON.stringify(new Date()), function() {  });
                break;
            }
        }
    }
}
