"use strict";
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const ObjectID = require("mongodb").ObjectID;
const http = require("http");
const WebSocketServer = require("ws").Server;
const aux = require("./helper");

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
    var onlineUsers = [];
    setTimeout(sendOnlineNotification, 10000);

    function sendOnlineNotification() {
        onlineUsers.length = 0;
        for (var user in sessions) {
            if (sessions[user].socket) {
                onlineUsers.push(sessions[user].user);
            }
        }
        aux.notifyAll(sessions);
        setTimeout(sendOnlineNotification, 30000);
    }

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
                            lastRead: {}
                        });
                        lastTransaction = Date.now();
                        aux.notifyAll(sessions);
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
    app.delete("/api/user/:conversationId/:userId", function(req, res) {
        console.log(req.params);
    });

    app.put("/api/user/:conversationId/:userId", function(req, res) {
        console.log("userId", req.params.userId);
        users.findOne({_id: req.params.userId}, function(err, doc) {
            if (!err) {
                let tempLastRead = doc.lastRead;
                tempLastRead[req.params.conversationId] = Date.now();
                users.updateOne({_id: req.params.userId},
                    {$set: {lastRead: tempLastRead}},
                    function(errUpdate, doc) {
                    if (!errUpdate) {
                        res.sendStatus(200);
                        aux.notifyUser(req.params.userId, sessions);
                    }
                });
            } else {
                console.log(err);
                res.sendStatus(500);
            }
        });
    });
    app.get("/api/users", function(req, res) {
        let retObj = {
            users: [],
            onlineUsers: onlineUsers
        };
        users.find().toArray(function(err, docs) {
            if (!err) {
                docs.map(function(user) {
                    if (!user.group) {
                        retObj.users.push({
                            id: user._id,
                            name: user.name,
                            avatarUrl: user.avatarUrl,
                            group: user.group
                        });
                    } else {
                        retObj.users.push({
                            id: user._id,
                            name: user.name,
                            avatarUrl: user.avatarUrl,
                            group: user.group
                        });
                    }
                });
                res.status(200).json(retObj);
            } else {
                res.sendStatus(500);
            }
        });
    });
    app.delete("/api/conversation/:conversationId", function(req, res) {
        console.log("req.params", req.params);
        if (req.params.conversationId === null ||
            req.params.conversationId === undefined ||
            req.params.conversationId === "null" ||
            req.params.conversationId === "undefined") {
            return res.sendStatus(404);
        } else {
            conversations.findOneAndUpdate({_id: new ObjectID(req.params.conversationId)},
                {$set: {messages: []}}, function(err, data) {
                if (!err && data) {
                    aux.notifyUser(data.value.firstMessageMeta.userFrom, sessions);
                    if (data.value.firstMessageMeta.userFrom !== data.value.firstMessageMeta.userTo) {
                        aux.notifyUser(data.value.firstMessageMeta.userTo, sessions);
                    }
                    res.sendStatus(200);
                } else if (err) {
                    res.sendStatus(500);
                } else {
                    res.sendStatus(404);
                }
            });
        }

    });
    app.get("/api/conversation/:conversationId", function(req, res) {
        if (req.params.conversationId === null ||
            req.params.conversationId === undefined ||
            req.params.conversationId === "null" ||
            req.params.conversationId === "undefined") {
            return res.sendStatus(404);
        }
        conversations.findOne({_id: new ObjectID(req.params.conversationId)}, function(err, conversation) {
            if (!err) {
                res.status(200).json(conversation);
            } else {
                console.log(err.message);
                res.sendStatus(500);
            }
        });
    });
    app.get("/api/conversations/:userId", function(req, res) {
        lastTransaction = Date.now();
        if (!req.params.userId ||
            req.params.userId === "null" ||
            req.params.userId === "undefined"
        ) {
            res.sendStatus(404);
        } else {
            users.findOne({_id: req.params.userId}, function (err, user) {
                if (!err) {
                    conversations.find({_id: {$in: user.subscribedTo}}).toArray(function(errConv, data) {
                        if (!errConv) {
                            let retVal = [];
                            for (var i in data) {
                                let participant = "";
                                if (req.params.userId === data[i].firstMessageMeta.userFrom) {
                                    participant = data[i].firstMessageMeta.userTo;
                                } else {
                                    participant = data[i].firstMessageMeta.userFrom;
                                }
                                retVal.push({
                                    id: data[i]._id,
                                    group: data[i].group,
                                    participant: participant,
                                    participants: data[i].firstMessageMeta.participants,
                                    timestamp: data[i].messages[0] ?
                                        data[i].messages[0].timestamp : data[i].firstMessageMeta.timestamp,
                                    userAlias: data[i].firstMessageMeta.userAlias,
                                    messages: data[i].messages
                                });
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
    //  Creates conversation or add messages to a conversation.
    //  notifies all users related to the conversation (gourp or private)
    //  Conversation can also be created from POST /api/group
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
                group: false,
                messages: [tempMessage],
                firstMessageMeta: {
                    userFrom: req.body.userFrom,
                    userTo:   req.body.userTo,
                    timestamp: tempMessage.timestamp
                }
            }, function (err, data) {
                if (!err) {
                    retConversationId = data.insertedId;
                    addConversationToUser(req.body.userFrom, data.insertedId, Date.now());
                    if (req.body.userFrom !== req.body.userTo) {
                        addConversationToUser(req.body.userTo, data.insertedId, 0);
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
                            console.log(conversation.group);
                            if (conversation.group) {
                                for (let i in conversation.firstMessageMeta.participants) {
                                    console.log(conversation.firstMessageMeta.participants[i], "sould be notified");
                                    aux.notifyUser(conversation.firstMessageMeta.participants[i], sessions);
                                }
                                console.log(conversation.firstMessageMeta.creator, "sould be notified");
                                aux.notifyUser(conversation.firstMessageMeta.creator, sessions);
                            } else {
                                aux.notifyUser(req.body.userTo, sessions);
                                aux.notifyUser(req.body.userFrom, sessions);
                            }
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

    app.put("/api/group/:groupId", function(req, res) {
        users.findOne({_id: req.params.groupId}, function(err, data) {
            if (!err) {
                if (!data) {
                    users.insertOne({
                        _id: req.params.groupId,
                        group: true,
                        avatarUrl: req.body.avatar,
                        subscribedTo : [],
                        lastRead: {}
                    }, function(errConv, dataConv) {
                        if (!errConv) {
                            conversations.insertOne({
                                group: true,
                                messages: [],
                                firstMessageMeta: {
                                    participants: req.body.participants,
                                    creator: req.body.creator,
                                    userAlias: req.params.groupId,
                                    timestamp: Date.now()
                                }
                            }, function (err2, data2) {
                                if (!err2) {
                                    console.log("insertedId", data2.insertedId);
                                    addConversationToUser(req.body.creator, data2.insertedId, Date.now());
                                    for (let i in req.body.participants) {
                                        addConversationToUser(
                                            req.body.participants[i], data2.insertedId, Date.now()
                                        );
                                    }
                                    res.sendStatus(201);
                                } else {
                                    console.log("err2", err2);
                                }
                            });
                        }

                    });
                } else {
                    console.log("data", data);
                    res.sendStatus(500);
                }
            } else {
                res.sendStatus(500);
            }
        });
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
    function addConversationToUser(userId, conversationId, timestamp) {
        users.findOne({_id: userId}, function(err, user) {
            if (!err) {
                user.subscribedTo.push(conversationId);
                user.lastRead[conversationId] = timestamp;
                users.updateOne({_id: userId},
                    {$set: {
                        subscribedTo: user.subscribedTo,
                        lastRead: user.lastRead
                    }},
                    function(err, data) {
                        if (!err) {
                            aux.notifyUser(userId, sessions);
                        } else {
                            console.log(err);
                        }
                    });
            }
        });
    }
};
