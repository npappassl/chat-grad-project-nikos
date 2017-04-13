"use strict";
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const ObjectID = require("mongodb").ObjectID;
const http = require("http");
const WebSocketServer = require("ws").Server;
const aux = require("./helper");

const statusCodes = {
    "ok": 200, "created": 201,
    "found": 302,
    "badRequest": 400, "notFound": 404, "unauthenticated": 401, "notAcceptable": 406,
    "intServErr": 500
};

module.exports = function(port, db, githubAuthoriser, middleware) {
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

    function sendOnlineNotification() {
        onlineUsers.length = 0;
        for (var user in sessions) {
            if (sessions[user].socket) {
                onlineUsers.push(sessions[user].user);
            }
        }
        aux.notifyAll(sessions);
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
                        aux.notifyAll(sessions);
                    }
                    sessions[token] = {
                        user: githubUser.login,
                    };
                    res.cookie("sessionToken", token);
                    res.header("Location", "/");
                    res.sendStatus(statusCodes.found);
                });
            }
            else {
                res.sendStatus(statusCodes.badRequest);
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
                res.sendStatus(statusCodes.unauthenticated);
            }
        } else {
            res.sendStatus(statusCodes.unauthenticated);
        }
    });

    app.get("/api/user", function(req, res) {
        users.findOne({
            _id: req.session.user
        }, function(err, user) {
            if (!err) {
                res.status(statusCodes.ok).json(user);
            } else {
                res.sendStatus(statusCodes.intServErr);
            }
        });
    });
    app.put("/api/user/:userId", function(req, res) {
        let name = req.body.name;
        let avatar = req.body.avatar;
        users.updateOne({_id: req.params.userId},
            {$set: {name: name, avatarUrl: avatar}}, function(err, data) {
                if (!err) {
                    res.sendStatus(statusCodes.ok);
                    aux.notifyAll(sessions, "users");
                } else {
                    res.sendStatus(statusCodes.intServErr);
                }
            });
    });
    app.delete("/api/user/:conversationId/:userId", function(req, res) {
        console.log(req.params);
        res.sendStatus(statusCodes.ok);
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
                        aux.notifyUser(req.params.userId, sessions);
                        res.sendStatus(statusCodes.ok);
                    } else {
                        res.sendStatus(statusCodes.intServErr);
                    }
                });
            } else {
                console.log(err);
                res.sendStatus(statusCodes.intServErr);
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
                res.status(statusCodes.ok).json(retObj);
            } else {
                res.sendStatus(statusCodes.intServErr);
            }
        });
    });
    app.delete("/api/conversation/:conversationId", function(req, res) {
        if (req.params.conversationId === null ||
            req.params.conversationId === undefined ||
            req.params.conversationId === "null" ||
            req.params.conversationId === "undefined" ||
            (req.params.conversationId.length !== 12 && req.params.conversationId.length !== 24)) {
            return res.sendStatus(statusCodes.notAcceptable);
        } else {
            conversations.findOneAndUpdate({_id: new ObjectID(req.params.conversationId)},
                {$set: {messages: []}}, dccConvFindOneAndUpdateCallback);
        }
        function dccConvFindOneAndUpdateCallback(err, data) {
            if (!err && data) {
                aux.notifyUser(data.value.firstMessageMeta.userFrom, sessions);
                if (data.value.firstMessageMeta.userFrom !== data.value.firstMessageMeta.userTo) {
                    aux.notifyUser(data.value.firstMessageMeta.userTo, sessions);
                }
                res.sendStatus(statusCodes.ok);
            } else if (err) {
                res.status(statusCodes.intServErr).send(err.message);
            } else {
                res.sendStatus(statusCodes.notFound);
            }
        }
    });
    app.get("/api/conversation/:conversationId", function(req, res) {
        if (req.params.conversationId === null ||
            req.params.conversationId === undefined ||
            req.params.conversationId === "null" ||
            req.params.conversationId === "undefined") {
            return res.sendStatus(statusCodes.notAcceptable);
        }
        conversations.findOne(
            {_id: new ObjectID(req.params.conversationId)},
            gccConvFindOneCallback
        );

        function gccConvFindOneCallback(err, conversation) {
            if (!err) {
                res.status(statusCodes.ok).json(conversation);
            } else {
                console.log(err.message);
                res.sendStatus(statusCodes.intServErr);
            }
        }
    });

    app.get("/api/conversations/:userId", function(req, res) {
        if (!req.params.userId ||
            req.params.userId === "null" ||
            req.params.userId === "undefined"
        ) {
            res.sendStatus(statusCodes.notAcceptable);
        } else {
            users.findOne({_id: req.params.userId}, gcuUserFindOneCallback);
        }
        function gcuUserFindOneCallback(err, user) {
            if (!err) {
                conversations.find({_id: {$in: user.subscribedTo}}).toArray(gcuConvFind);
            }else {
                console.log(err);
                res.sendStatus(statusCodes.intServErr);
            }
        }
        function gcuConvFind(errConv, data) {
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
                res.status(statusCodes.ok).json(retVal);
            } else {
                console.log(errConv);
                res.sendStatus(statusCodes.intServErr);
            }
        }
    });
    //  Creates conversation or add messages to a conversation.
    //  notifies all users related to the conversation (gourp or private)
    //  Conversation can also be created from POST /api/group
    app.post("/api/message", function(req, res) {
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
            }, pmConversationInsertCallback);
        } else {
            retConversationId = req.body.conversationId;
            conversations.findOne({_id: new ObjectID(retConversationId)}, pmConversationFindCallback);
        }
        // function delarations ________________________________________________
        function pmConversationInsertCallback(err, data) {
            if (!err) {
                retConversationId = data.insertedId;
                addConversationToUser(req.body.userFrom, data.insertedId, Date.now());
                console.log(req.body.userFrom, req.body.userTo);
                if (req.body.userFrom !== req.body.userTo) {
                    addConversationToUser(req.body.userTo, data.insertedId, 0);
                }
                res.status(statusCodes.created).json(retConversationId);
            } else {
                console.log(err);
                res.sendStatus(statusCodes.intServErr);
            }
        }
        function pmConversationFindCallback(err, conversation) {
            if (!err) {
                conversation.messages.unshift(tempMessage);
                conversations.updateOne(
                    {_id: new ObjectID(retConversationId)},
                    {$set: {messages: conversation.messages}},
                    function(errorUpdate, data) {
                        pmConversationUpdateCallback(errorUpdate, data, conversation);
                    });
            } else {
                console.log(err, "is an error");
                res.sendStatus(statusCodes.intServErr);
            }
        }
        function pmConversationUpdateCallback(errUpdate, data, conversation) {
        if (!errUpdate) {
            res.status(statusCodes.ok).json(retConversationId);
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
            res.sendStatus(statusCodes.intServErr);
        }
    }
    });

    app.post("/api/group/:groupId", function(req, res) {
        const preparedUserObj = {
            _id: req.params.groupId,
            group: true,
            name: null,
            avatarUrl: req.body.avatar,
            subscribedTo : [],
            lastRead: {}
        };
        const preparedGroupObj = {
            group: true,
            messages: [],
            firstMessageMeta: {
                participants: req.body.participants,
                creator: req.body.creator,
                userAlias: req.params.groupId,
                timestamp: Date.now()
            }
        };
        users.findOne({_id: req.params.groupId}, function(err, data) {
            if (!err) {
                if (!data) {
                    users.insertOne(preparedUserObj, function(errConv, dataConv) {
                        if (!errConv) {
                            conversations.insertOne(preparedGroupObj, function (err2, data2) {
                                if (!err2) {
                                    console.log("insertedId", data2.insertedId);
                                    addConversationToAllParticipants(req.body, data2.insertedId, Date.now());
                                    res.sendStatus(statusCodes.created);
                                } else {
                                    console.log("err2", err2);
                                    res.sendStatus(statusCodes.intServErr);
                                }
                            });
                        } else {
                            res.sendStatus(statusCodes.intServErr);
                        }
                    });
                } else {
                    res.sendStatus(statusCodes.intServErr);
                }
            } else {
                res.sendStatus(statusCodes.intServErr);
            }
        });
        function addConversationToAllParticipants(reqBody, d2insertedId, timestamp) {
            addConversationToUser(reqBody.creator, d2insertedId, timestamp);
            for (let i in reqBody.participants) {
                addConversationToUser(
                    reqBody.participants[i], d2insertedId, timestamp
                );
            }
        }
    });
    app.put("/api/group/:groupId", function(req, res) {
        const updateObject = {
            avatarUrl: req.body.avatar,
            name: req.body.name || null
        };
        users.updateOne({_id: req.params.groupId},
            {$set: updateObject},
            function(err, data) {
                if (!err) {
                    res.sendStatus(statusCodes.ok);
                } else {
                    res.sendStatus(statusCodes.intServErr);
                }
            });
    });
    //------------------------------ web socket server -------------------------
    const server = http.createServer(app);

    let wss = new WebSocketServer({server: server});
    // -------------- connection------------------------------------------------
    wss.on("connection", function connection(ws) {
        let sesToken = aux.parseCookie(ws.upgradeReq.headers.cookie);
        if (!sessions[sesToken]) {
            ws.close();
        } else {
            sessions[sesToken].socket = ws;
        }
        sendOnlineNotification();

        console.log("websocket connection open:", sesToken);

        // -------------- close connection -------------------------------------
        ws.on("close", function() {
            if (sessions[sesToken]) {
                sessions[sesToken].socket = null;
            }
            sendOnlineNotification();
            console.log("websocket connection close:", sesToken);
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
