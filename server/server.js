"use strict";
var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const ObjectID = require("mongodb").ObjectID;

const http = require("http");
const WebSocketServer = require("ws").Server;

const getMessagesRelativeTo = getFilteredMessages;

module.exports = function(port, db, githubAuthoriser, middleware) {
    let lastTransaction = Date.now();
    var app = express();

    for (let i in middleware) {
        app.use(middleware[i]);
    }
    app.use(bodyParser.json());
    app.use(cookieParser());

    app.use(express.static("public"));
    var users = db.collection("users");
    var conversations = db.collection("conversations");
    var messages = db.collection("messages");
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
    app.put("/api/user/subscribe/:id/:subscribeTo", function(req, res) {
        users.findOne({
            _id: req.params.id
        }, function(err, user) {
            let index = user.subscribedTo.find(function(subscription) {
                 return subscription.user === req.params.subscribeTo;
             });
            if (!index) {
                user.subscribedTo.push({
                    user: req.params.subscribeTo,
                    lastRead: Date.now()
                });
            } else {
                index.lastRead = Date.now();
            }
            try {
                users.updateOne(
                    {_id: req.params.id},
                    {$set: {"subscribedTo": user.subscribedTo}}
                );
                lastTransaction = Date.now();
                res.sendStatus(200);
            } catch (e) {
                res.sendStatus(500);
                console.log(e);
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
    app.get("/api/messages", function(req, res) {
        messages.find().toArray(function(err, docs) {
            if (!err) {
                const retVal = {
                    lastTrans: lastTransaction,
                    messages: docs.map(function(message) {
                        return {
                            to: message.userTo,
                            from: message.userFrom,
                            msg: message.msg
                        };
                    })
                };
                res.json(retVal);
            } else {
                res.sendStatus(500);
            }
        });
    });

    app.get("/api/messages/:id", function(req, res) {
        messages.find().toArray(function(err, docs) {
            if (!err) {
                const retVal = {
                    lastTrans: lastTransaction,
                    messages: getMessagesRelativeTo(req.params.id, docs)
                    .map(function(message) {
                        return {
                            to: message.userTo,
                            from: message.userFrom,
                            msg: message.msg,
                            timestamp: message.timestamp
                        };
                    })
                };
                res.json(retVal);
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
            if (err) {
                console.log(err.message);
                res.sendStatus(500);
            } else if (!err) {
                console.log(conversation);
                res.status(200).json(conversation);
            }
        });
    });
    app.get("/api/conversations/:userId", function(req, res) {
        lastTransaction = Date.now();
        if (!req.params.userId) {
            res.sendStatus(404);
        }
        users.findOne({_id: req.params.userId}, function (err, user) {
            if (!err) {
                conversations.find({_id: {$in: user.subscribedTo}}).toArray(function(err, data) {
                    if (!err) {
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
                                timestamp: data[i].messages[0].timestamp
                            });
                            console.log(i, data[i]);
                        }
                        res.status(200).json(retVal);
                    }else {
                        console.log(err);
                    }
                });
            }else {
                res.sendStatus(500);
            }
        });
    });
    app.post("/api/message", function(req, res) {
        lastTransaction = Date.now();
        let retConversationId = "";
        console.log(req.body);
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
                }
            });
        } else {
            retConversationId = req.body.conversationId;
            console.log(retConversationId, "retConversationId");
            conversations.findOne({_id: new ObjectID(retConversationId)}, function (err, conversation) {
                if (!err) {
                    console.log(conversation);
                    conversation.messages.push(tempMessage);
                    try {
                        conversations.updateOne({_id: new ObjectID(retConversationId)},
                            {$set: {messages: conversation.messages}});
                    } catch (e) {
                        console.log(e, "error Caught");
                    }
                } else {
                    console.log(err, "is an error");
                }
            });
        }
        // messages.insertOne(tempMessage, function(err,data) {
        //     console.log("message inserted as",data.insertedId);
        // });
        res.status(200).json(retConversationId);
    });

    app.get("/api/state", function(req, res) {
        res.json(lastTransaction);
    });

    //------------------------------ web socket server -------------------------
    const server = http.createServer(app);

    let wss = new WebSocketServer({server: server});
    console.log("websocket server created");
    wss.on("connection", function connection(ws) {
        let sesToken;
        let cookie = ws.upgradeReq.headers.cookie;
        if (cookie) {
            sesToken = cookie.split("=")[1];
            console.log(sesToken);
            console.log(sessions[sesToken]);
        }
        if (!sessions[sesToken]) {
            ws.close();
        }
        var id = setInterval(function() {
            console.log(new Date(), sessions[sesToken]);
            ws.send(JSON.stringify(new Date()), function() {  });
        }, 4000);

        console.log("websocket connection open");

        ws.on("close", function() {
            console.log("websocket connection close");
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
                        console.log(data);
                    });
            }
        });
    }
};
//-------------------  My auxiliary functions  GLOBAL --------------------------

function getFilteredMessages(id, docs) {
    return docs.filter(function(message) {
        return (
            message.userFrom === id ||
            message.userTo === id
        );
    });
}
