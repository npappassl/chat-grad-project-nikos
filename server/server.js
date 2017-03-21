"use strict";
var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

const getMessagesRelativeTo = getFilteredMessages;

module.exports = function(port, db, githubAuthoriser, middleware) {
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
                            avatarUrl: githubUser.avatar_url
                        });
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
                res.json(user);
            } else {
                res.sendStatus(500);
            }
        });
    });

    app.get("/api/users", function(req, res) {
        users.find().toArray(function(err, docs) {
            if (!err) {
                res.json(docs.map(function(user) {
                    return {
                        id: user._id,
                        name: user.name,
                        avatarUrl: user.avatarUrl
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
                res.json(docs.map(function(message) {
                    return {
                        to: message.userTo,
                        from: message.userFrom,
                        msg: message.msg
                    };
                }));
            } else {
                res.sendStatus(500);
            }
        });
    });

    app.get("/api/messages/:id", function(req, res) {
        messages.find().toArray(function(err, docs) {
            if (!err) {
                res.json(getMessagesRelativeTo(req.params.id, docs)
                .map(function(message) {
                    return {
                        to: message.userTo,
                        from: message.userFrom,
                        msg: message.msg
                    };
                }));
            } else {
                res.sendStatus(500);
            }
        });
    });
    app.post("/api/message", function(req, res) {
        console.log(req.body);
        messages.insertOne(req.body);
        res.sendStatus(200);
    });
    return app.listen(port);
};
//  My auxiliary functions
function getFilteredMessages(id, docs) {
    return docs.filter(function(message) {
        return (
            message.userFrom === id ||
            message.userTo === id
        );
    });
}
