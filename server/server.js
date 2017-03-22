"use strict";
var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

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
                            subsribedTo: [],
                            subscriptionRequests: []
                        });
                        lastTransaction = Date.now();
                    }
                    sessions[token] = {
                        user: githubUser.login
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
    app.put("/api/user/subscribe/:id/:subsribeTo", function(req, res) {
        users.findOne({
            _id: req.params.id
        }, function(err, user) {
            if (user.subsribedTo.indexOf(req.params.subsribeTo) < 0) {
                user.subsribedTo.push(req.params.subsribeTo);
                console.log(user);
            }
            try {
                users.updateOne(
                    {_id: req.params.id},
                    {$set: {"subsribedTo": user.subsribedTo}}
                );
            } catch (e) {
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
                        subsribedTo: user.subsribedTo,
                        subscriptionRequests: user.subscriptionRequests
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
    app.post("/api/message", function(req, res) {
        lastTransaction = Date.now();
        console.log(req.body);
        const tempMessage = {
            userFrom: req.body.userFrom,
            userTo:   req.body.userTo,
            msg:      req.body.msg,
            timestamp: Date.now()
        };
        messages.insertOne(tempMessage);
        res.sendStatus(200);
    });
    return app.listen(port);
};
//-------------------  My auxiliary functions ----------------------------------
function getFilteredMessages(id, docs) {
    return docs.filter(function(message) {
        return (
            message.userFrom === id ||
            message.userTo === id
        );
    });
}
