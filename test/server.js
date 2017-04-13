"use strict";
const server = require("../server/server");
const request = require("request");
const assert = require("chai").assert;
const sinon = require("sinon");
const ObjectID = require("mongodb").ObjectID;
const WebSocket = require("ws");

//------- I added this so that webpack is instantiated -------------------------
const isDeveloping = process.env.NODE_ENV !== "production";
const webpack = require("webpack");
const webpackMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const config = require("../webpack.config.js");
//------------------------------------------------------------------------------

const testPort = 52684;
const baseUrl = "http://localhost:" + testPort;
const oauthClientId = "1234clientId";

const statusCodes = {
    "OK": 200, "created": 201,
    "found": 302,
    "badRequest": 400, "notFound": 404, "Unauthenticated": 401,
    "intServErr": 500
};

const testUser = {
    _id: "bob",
    name: "Bob Bilson",
    avatarUrl: "http://avatar.url.com/u=test",
    subscribedTo: [],
    lastRead: {
        "58d52c27983d681738f5455e": 23123
    }
};
const testToken = "123123";
const testToken2 = "321321";

const testUser2 = {
    _id: "nikos",
    name: "Charlie Colinson",
    avatarUrl: "http://avatar.url.com/u=charlie_colinson"
};
const testGithubUser = {
    login: "bob",
    name: "Bob Bilson",
    avatar_url: "http://avatar.url.com/u=test"
};
const testGroupUser = {
    "_id": "dikemou",
    "group": true,
    "avatarUrl": "https://www.codeproject.com/KB/testing/1002904/Test-URL-Redirects-HttpWebRequest.jpg",
    "subscribedTo": [],
    "lastRead": {}
};
const testExpiredToken = "987978";
const testMessage1 = {
    userTo: "bob",
    userFrom: "giannis",
    msg: "this is a message 1"
};
const testMessage2 = {
    userTo: "nikos",
    userFrom: "kwstas",
    msg: "this is a message 2"
};
const testMessages = [testMessage1, testMessage2];
const testConversation = {
    _id: {
        "$oid": "58d52c27983d681738f5449e"
    },
    messages: testMessages,
    group: false,
    firstMessageMeta: {
        userFrom: "bob",
        userTo:  "nikos",
        timestamp: 12312542353453
    }
};
const testConversationGroup = {
    _id: {
        "$oid": "58d52c27983d681738f5455e"
    },
    messages: [testMessages[1]],
    group: true,
    firstMessageMeta: {
        creator: "giannis",
        participants: ["nikos", "kwstas", "bob"],
        timestamp: 12312542353453
    }
};
const testConversationGroupEmpty = {
    _id: {
        "$oid": "58d52c27983d681738f5455e"
    },
    messages: [],
    group: true,
    firstMessageMeta: {
        creator: "giannis",
        participants: ["nikos", "kwstas", "bob"],
        timestamp: 12312542353453
    }
};

describe("server", function() {
    var cookieJar;
    var db;
    var githubAuthoriser;
    var serverInstance;
    var dbCollections;
    let middleware = [];
    this.timeout(20000);
    if (isDeveloping) {
        const compiler = webpack(config);
        middleware[0] = webpackMiddleware(compiler, {
            publicPath: config.output.publicPath,
            contentBase: "src",
            stats: {
                errorDetails: false,
                errors: false,
                assets: false,
                source: false,
                reasons: false,
                warnings: false,
                noInfo: true,
                info: false,
                quiet: true,
                colors: true,
                hash: false,
                timings: false,
                chunks: false,
                chunkModules: false,
                modules: false
            }
        });
        middleware[1] = webpackHotMiddleware(compiler);
    }
    beforeEach(function() {
        cookieJar = request.jar();
        dbCollections = {
            users: {
                find: sinon.stub(),
                findOne: sinon.stub(),
                insertOne: sinon.stub(),
                updateOne: sinon.stub()
            },
            conversations: {
                find: sinon.stub(),
                findOne: sinon.stub(),
                insertOne: sinon.stub(),
                updateOne: sinon.stub(),
                findOneAndUpdate: sinon.stub()
            }
        };
        db = {
            collection: sinon.stub()
        };
        db.collection.withArgs("users").returns(dbCollections.users);
        db.collection.withArgs("conversations").returns(dbCollections.conversations);

        githubAuthoriser = {
            authorise: function() {},
            oAuthUri: "https://github.com/login/oauth/authorize?client_id=" + oauthClientId
        };
        serverInstance = server(testPort, db, githubAuthoriser, middleware);
    });
    afterEach(function() {
        for (let prop in dbCollections) {
            for (let stb in dbCollections[prop]) {
                dbCollections[prop][stb].resetBehavior();
            }
        }
        serverInstance.close();
    });
    function authenticateUser(user, token, callback) {
        sinon.stub(githubAuthoriser, "authorise", function(req, authCallback) {
            authCallback(user, token);
        });

        dbCollections.users.findOne.callsArgWith(1, null, user);

        request(baseUrl + "/oauth", function(error, response) {
            cookieJar.setCookie(request.cookie("sessionToken=" + token), baseUrl);
            dbCollections.users.findOne = sinon.stub(); // TODO
            callback();
        });
    }
    describe("GET /oauth", function() {
        var requestUrl = baseUrl + "/oauth";

        it("responds with status code 400 if oAuth authorise fails", function(done) {
            var stub = sinon.stub(githubAuthoriser, "authorise", function(req, callback) {
                callback(null);
            });

            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 400);
                done();
            });
        });
        it("responds with status code 302 if oAuth authorise succeeds", function(done) {
            var user = testGithubUser;
            var stub = sinon.stub(githubAuthoriser, "authorise", function(req, authCallback) {
                authCallback(user, testToken);
            });

            dbCollections.users.findOne.callsArgWith(1, null, user);

            request({url: requestUrl, followRedirect: false}, function(error, response) {
                assert.equal(response.statusCode, 302);
                done();
            });
        });
        it("responds with a redirect to '/' if oAuth authorise succeeds", function(done) {
            var user = testGithubUser;
            var stub = sinon.stub(githubAuthoriser, "authorise", function(req, authCallback) {
                authCallback(user, testToken);
            });

            dbCollections.users.findOne.callsArgWith(1, null, user);

            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 200);
                assert.equal(response.request.uri.path, "/");
                done();
            });
        });
        it("add user to database if oAuth authorise succeeds and user id not found", function(done) {
            var user = testGithubUser;
            var stub = sinon.stub(githubAuthoriser, "authorise", function(req, authCallback) {
                authCallback(user, testToken);
            });

            dbCollections.users.findOne.callsArgWith(1, null, null);

            request(requestUrl, function(error, response) {
                assert(dbCollections.users.insertOne.calledOnce);
                assert.deepEqual(dbCollections.users.insertOne.firstCall.args[0], {
                    _id: "bob",
                    name: "Bob Bilson",
                    group: false,
                    avatarUrl: "http://avatar.url.com/u=test",
                    lastRead: {},
                    subscribedTo: []
                });
                done();
            });
        });
    });
    describe("GET /api/oauth/uri", function() {
        var requestUrl = baseUrl + "/api/oauth/uri";
        it("responds with status code 200", function(done) {
            // dbCollections.users.findOne.callsArgWith(1, null, user); TODO
            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
        it("responds with a body encoded as JSON in UTF-8", function(done) {
            request(requestUrl, function(error, response) {
                assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
                done();
            });
        });
        it("responds with a body that is a JSON object containing a URI to GitHub with a client id", function(done) {
            request(requestUrl, function(error, response, body) {
                assert.deepEqual(JSON.parse(body), {
                    uri: "https://github.com/login/oauth/authorize?client_id=" + oauthClientId
                });
                done();
            });
        });
    });
    describe("GET /api/user", function() {
        var requestUrl = baseUrl + "/api/user";
        it("responds with status code 401 if user not authenticated", function(done) {
            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with status code 401 if user has an unrecognised session token", function(done) {
            cookieJar.setCookie(request.cookie("sessionToken=" + testExpiredToken), baseUrl);
            request({url: requestUrl, jar: cookieJar}, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with status code 200 if user is authenticated", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, null, testUser);
                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with a body that is a JSON object if user is authenticated", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, null, testUser);
                request({url: requestUrl, jar: cookieJar}, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body), {
                        _id: "bob",
                        name: "Bob Bilson",
                        avatarUrl: "http://avatar.url.com/u=test",
                        subscribedTo: [],
                        lastRead: {
                            "58d52c27983d681738f5455e": 23123
                        }
                    });
                    done();
                });
            });
        });
        it("responds with status code 500 if database error", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, {err: "Database error"}, null);
                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
    });
    describe("PUT /api/user/:userId", function() {
        var requestUrl = baseUrl + "/api/user/" + testUser._id;
        it("responds with status code 401 if user not authenticated", function(done) {
            request({url: requestUrl, method: "PUT"}, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with status code 200 if user is authenticated", function(done) {
            authenticateUser(testGithubUser, testToken, function() {

                dbCollections.users.updateOne.callsArgWith(2, null, testUser);

                request({url: requestUrl, jar: cookieJar, method: "PUT"}, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with sattus code 500 if mongo trouble", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.updateOne.callsArgWith(2, {err: "thisisErrr"}, null);

                request({url: requestUrl, jar: cookieJar, method: "PUT"}, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
    });
    describe("DELETE /api/user/:conversationId/:userId", function() {
        var requestUrl = baseUrl + "/api/user/" + testConversation.id + "/" + testUser._id;
        it("finds route, does nothing", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "DELETE"}, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
    });
    describe("PUT /api/user/:conversationId/:userId", function() {
        var requestUrl = baseUrl + "/api/user/" + testConversation.id + "/" + testUser._id;
        it("responds with status code 401 if user not authenticated", function(done) {
            request({url: requestUrl, method: "PUT"}, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with status code 200 if user is authenticated", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, null, testUser);
                dbCollections.users.updateOne.callsArgWith(2, null, testUser);

                request({url: requestUrl, jar: cookieJar, method: "PUT"}, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with status code 500 if users findOne errors", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, {err: "this errored allright"}, null);
                dbCollections.users.updateOne.callsArgWith(2, null, testUser);

                request({url: requestUrl, jar: cookieJar, method: "PUT"}, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
        it("responds with status code 500 if users updateOne errors", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, null, testUser);
                dbCollections.users.updateOne.callsArgWith(2, {err: "this errored allright"}, null);

                request({url: requestUrl, jar: cookieJar, method: "PUT"}, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
    });
    describe("GET /api/users", function() {
        var requestUrl = baseUrl + "/api/users";
        var allUsers;
        beforeEach(function() {
            allUsers = {
                toArray: sinon.stub()
            };
            dbCollections.users.find.returns(allUsers);
        });
        it("responds with status code 401 if user not authenticated", function(done) {
            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with status code 401 if user has an unrecognised session token", function(done) {
            cookieJar.setCookie(request.cookie("sessionToken=" + testExpiredToken), baseUrl);
            request({url: requestUrl, jar: cookieJar}, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with status code 200 if user is authenticated", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                allUsers.toArray.callsArgWith(0, null, [testUser, testGroupUser]);

                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with a body that is a JSON object if user is authenticated", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                allUsers.toArray.callsArgWith(0, null, [
                        testUser,
                        testUser2
                    ]);

                request({url: requestUrl, jar: cookieJar}, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body).users, [
                        {
                            id: "bob",
                            name: "Bob Bilson",
                            avatarUrl: "http://avatar.url.com/u=test"
                        },
                        {
                            id: "nikos",
                            name: "Charlie Colinson",
                            avatarUrl: "http://avatar.url.com/u=charlie_colinson"
                        }
                    ]);
                    done();
                });
            });
        });
        it("responds with status code 500 if database error", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                allUsers.toArray.callsArgWith(0, {err: "Database failure"}, null);
                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
    });
    describe("DELETE api/conversation/:conversationId", function() {
        var requestUrl = baseUrl + "/api/conversation/";
        beforeEach(function() {
            dbCollections.conversations.findOneAndUpdate.callsArgWith(2, null, {value: testConversationGroup});
        });
        it("responds with statusCode 401 if unauthorized", function(done) {
            request({url: requestUrl + "null", method: "DELETE"}, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with statusCode 406 if conversationId === null", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl + "null", jar: cookieJar, method: "DELETE"}, function(error, response) {
                    assert.equal(response.statusCode, 406);
                    done();
                });
            });
        });
        it("responds with statusCode 406 if conversationId === undefined", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl + "undefined", jar: cookieJar, method: "DELETE"},
                       function(error, response) {
                    assert.equal(response.statusCode, 406);
                    done();
                });
            });
        });
        it("responds with statusCode 404 if notfound", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.conversations.findOneAndUpdate.callsArgWith(2, null, null);
                request({
                    url: requestUrl + "thiswrongIds", jar: cookieJar, method: "DELETE"
                }, function(error, response) {
                    assert.equal(response.statusCode, 404);
                    done();
                });
            });
        });
        it("responds with statusCode 406 if conversationId is invalid", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                request({
                    url: requestUrl + "thisAnInvalidId", jar: cookieJar, method: "DELETE"
                }, function(error, response) {
                    assert.equal(response.statusCode, 406);
                    done();
                });
            });
        });
        it("responds with statusCode 500 if findOneAndUpdate errors", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.conversations.findOneAndUpdate.callsArgWith(2, {err: "findOneAndUpdateerrored"}, null);
                request({
                    url: requestUrl + "thiswrongIds", jar: cookieJar, method: "DELETE"
                }, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
        it("responds with statusCode 200 if group conversationId is found", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.conversations.findOneAndUpdate.callsArgWith(2, null, {value: testConversationGroup});
                request({
                    url: requestUrl + "58d52c27983d681738f5455e", jar: cookieJar, method: "DELETE"
                }, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with statusCode 200 if nonGourpConversation conversationId is found", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.conversations.findOneAndUpdate.callsArgWith(2, null, {value: testConversation});
                request({
                    url: requestUrl + "58d52c27983d681738f5455e", jar: cookieJar, method: "DELETE"
                }, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
    });
    describe("GET api/conversation/:conversationId", function() {
        let requestUrl = baseUrl + "/api/conversation/" + "58d52c27983d681738f5449e";
        var conversation;
        beforeEach(function() {
            conversation = sinon.stub();
            dbCollections.conversations.findOne.returns(conversation);

        });
        it("gets the specific conversation", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.conversations.findOne.callsArgWith(1, null,
                     JSON.parse(JSON.stringify(testConversation)));
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(2, JSON.parse(body).messages.length);
                    done();
                });
            });
        });
        it("gets the specific group conversation", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.conversations.findOne.callsArgWith(
                    1, null, JSON.parse(JSON.stringify(testConversationGroup))
                );

                request({
                    url: baseUrl + "/api/conversation/58d52c27983d681738f5455e", jar: cookieJar, method: "GET"
                }, function(error, response, body) {
                    assert.equal(1, JSON.parse(body).messages.length);
                    done();
                });
            });
        });
        it("returns 406 when no reqParams -- null", function(done) {
            requestUrl = baseUrl + "/api/conversation/null";
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(response.statusCode, 406);
                    done();
                });
            });
        });
        it("returns 406 when no reqParams -- undefined", function(done) {
            requestUrl = baseUrl + "/api/conversation/undefined";
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(response.statusCode, 406);
                    done();
                });
            });
        });
        it("returns 500 when conversation findOne errors", function(done) {
            requestUrl = baseUrl + "/api/conversation/58d52c27983d681738f5449e";
            dbCollections.conversations.findOne.callsArgWith(1, {err: "Database error"}, null);
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(500, response.statusCode);
                    done();
                });
            });
        });
    });
    describe("GET api/conversations/:userId", function() {
        var requestUrl = baseUrl + "/api/conversations/" + testUser._id;

        var conversation;
        beforeEach(function() {
            conversation = {
                toArray: sinon.stub()
            };
            dbCollections.conversations.find.returns(conversation);
        });
        it("returns all conversation from specific user",  function (done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, null, testUser);
                conversation.toArray.callsArgWith(0, null,
                    [testConversation, testConversationGroup, testConversationGroupEmpty]);
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(3, JSON.parse(body).length);
                    done();
                });
            });
        });
        it("returns 500 when conversations find errors ",  function (done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, null, testUser);
                conversation.toArray.callsArgWith(0, {err: "Database error"}, null);
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(500, response.statusCode);
                    done();
                });
            });
        });
        it("returns 500 when users findOne errors ",  function (done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, "Database error -- cannot find user", null);
                conversation.toArray.callsArgWith(0, null, [testConversation]);
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
        it("returns 406 when userId is undefined",  function (done) {
            requestUrl = baseUrl + "/api/conversations/undefined";
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, null, testUser);
                conversation.toArray.callsArgWith(0, null, [testConversation]);
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(response.statusCode, 406);
                    done();
                });
            });
        });
    });
    describe("POST api/message", function() {
        var requestUrl = baseUrl + "/api/message/";

        it("responds with status code 401 if user not authenticated", function(done) {
            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with 200 if message posted -- old conversation", function(done) {
            const objOld = {
                conversationId: "58d52c27983d681738f5449e",
                userFrom: "nikos",
                userTo: "bob",
                msg: "ela re twra"
            };
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.conversations.findOne.callsArgWith(1, null,
                           JSON.parse(JSON.stringify(testConversation)));
                dbCollections.conversations.updateOne.callsArgWith(2, null, null);
                request({
                    url: requestUrl, jar: cookieJar,
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(objOld)
                }, function(error, response, body) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with 200 if message posted -- old group conversation", function(done) {
            const objOld = {
                conversationId: "58d52c27983d681738f5449e",
                userFrom: "nikos",
                userTo: "bob",
                msg: "ela re twra"
            };
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.conversations.findOne.callsArgWith(
                    1, null, JSON.parse(JSON.stringify(testConversationGroup)));
                dbCollections.conversations.updateOne.callsArgWith(2, null, null);
                request({
                    url: requestUrl, jar: cookieJar,
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(objOld)
                }, function(error, response, body) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        // ___________------ I have no Idea what provokes this ------___________
        it("responds with 500 if conv findOne fails", function(done) {
            const objOld = {
                conversationId: "58d52c27983d681738f5449e",
                userFrom: "nikos",
                userTo: "bob",
                msg: "ela re twra"
            };
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.conversations.findOne.callsArgWith(1, {err: "Not found"}, null);
                request({
                    url: requestUrl, jar: cookieJar,
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(objOld)
                }, function(error, response, body) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
        it("responds with 500 if conv udateOne fails", function(done) {
            const objOld = {
                conversationId: "58d52c27983d681738f5449e",
                userFrom: "nikos",
                userTo: "bob",
                msg: "ela re twra"
            };
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.conversations.findOne.callsArgWith(1, null,
                           JSON.parse(JSON.stringify(testConversation)));
                dbCollections.conversations.updateOne.callsArgWith(2, {err: "Not found"}, null);
                request({
                    url: requestUrl, jar: cookieJar,
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(objOld)
                }, function(error, response, body) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
        it("responds with 201 if message posted -- new conversation", function(done) {
            const objNew = {
                conversationId: undefined,
                userFrom: "nikos",
                userTo: "bob",
                msg: "ela re twra"
            };
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.conversations.insertOne.callsArgWith(1, null,
                       {insertedId: "58d52c27983d681738f5449e"});
                dbCollections.users.findOne.callsArgWith(1, null, testUser);
                request({url: requestUrl, jar: cookieJar,
                    method: "POST", headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(objNew)
                }, function(error, response, body) {
                    assert.equal(response.statusCode, 201);
                    done();
                });
            });
        });
        it("responds with 201 if message posted -- new conversation no errors is userTo===userFrom", function(done) {
            const objNew = {
                conversationId: undefined,
                userFrom: "bob",
                userTo: "bob",
                msg: "ela re twra"
            };
            authenticateUser(testUser, testToken, function() {
                dbCollections.conversations.insertOne.callsArgWith(1, null,
                     {insertedId: "58d52c27983d681738f5449e"});
                dbCollections.users.findOne.callsArgWith(1, null, testUser);
                request({url: requestUrl, jar: cookieJar,
                    method: "POST", headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(objNew)
                }, function(error, response, body) {
                    assert.equal(response.statusCode, 201);
                    done();
                });
            });
        });
        it("responds with 500 when insertOne Conversation fails -- new conversation", function(done) {
            const objNew = {
                conversationId: undefined,
                userFrom: "nikos",
                userTo: "bob",
                msg: "ela re twra"
            };
            authenticateUser(testUser, testToken, function() {
                dbCollections.conversations.insertOne.callsArgWith(1, {err: "cannot insert conversation"}, null);
                request({url: requestUrl, jar: cookieJar,
                    method: "POST", headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(objNew)
                }, function(error, response, body) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
    });
    describe("POST api/group/:groupId", function () {
        const requestUrl = baseUrl + "/api/group/";
        it("return 401 when unauthorized", function(done) {
            request({url: requestUrl + "dikemou", method: "POST"}, function(error, response, body) {
                assert(response.statusCode, 401);
                done();
            });
        });
        it("return 500 when findOne Errorrs", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, {err: "findoone errored"}, null);
                dbCollections.users.insertOne.callsArgWith(1, null, null);
                request({url: requestUrl + "dikemou", jar: cookieJar, method: "POST"},
                function(error, response, body) {
                    assert(response.statusCode, 500);
                    done();
                });
            });
        });
        it("return 500 when insertOne Errorrs", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, null, null);
                dbCollections.users.insertOne.callsArgWith(1, {err: "insertone errored"}, null);
                request({url: requestUrl + "dikemou", jar: cookieJar, method: "POST"},
                function(error, response, body) {
                    assert(response.statusCode, 500);
                    done();
                });
            });
        });
        it("return 500 when convInsertone Errorrs", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, null, null);
                dbCollections.users.insertOne.callsArgWith(1, null, null);
                dbCollections.conversations.insertOne.callsArgWith(1, {err: "ERROR3sf9wdhf928g92fygf"}, null);
                request({url: requestUrl + "dikemou", jar: cookieJar, method: "POST"},
                function(error, response, body) {
                    assert(response.statusCode, 500);
                    done();
                });
            });
        });
        it("return 201 when userExists", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, null, testUser);
                dbCollections.users.insertOne.callsArgWith(1, null, null);
                request({url: requestUrl + "dikemou", jar: cookieJar, method: "POST"},
                function(error, response, body) {
                    console.log("error", body);
                    assert(response.statusCode, 201);
                    done();
                });
            });
        });
        it("return 201 when created userGroup", function(done) {
            authenticateUser(testUser, testToken, function() {
                dbCollections.users.findOne.onCall(0).callsArgWith(1, null, null);
                dbCollections.users.findOne.onCall(1).callsArgWith(1, null, testUser);
                dbCollections.users.insertOne.callsArgWith(1, null, null);
                dbCollections.conversations.insertOne.callsArgWith(1, null, {insertedId: "3sf9wdhf928g92fygf"});
                dbCollections.users.updateOne.callsArgWith(2, null, {value: testUser});
                request({url: requestUrl + "dikemou", jar: cookieJar, method: "POST",
                            headers: {"Content-type": "application/json"},
                            body: JSON.stringify({creator: "bob", participants: ["bob", "nikos"]})},
                function(error, response, body) {
                    assert(response.statusCode, 201);
                    done();
                });
            });
        });
        it("return 201 when created userGroup but usercouldnot be added", function(done) {
            authenticateUser(testUser, testToken, function() {
                dbCollections.users.findOne.onCall(0).callsArgWith(1, null, null);
                dbCollections.users.findOne.onCall(1).callsArgWith(1,
                    {err: "user tal wasn't added to group conversattion"}, null);
                dbCollections.users.insertOne.callsArgWith(1, null, null);
                dbCollections.conversations.insertOne.callsArgWith(1, null, {insertedId: "3sf9wdhf928g92fygf"});
                request({url: requestUrl + "dikemou", jar: cookieJar, method: "POST",
                            headers: {"Content-type": "application/json"},
                            body: JSON.stringify({creator: "bob", participants: ["bob", "nikos"]})},
                function(error, response, body) {
                    assert(response.statusCode, 201);
                    done();
                });
            });
        });
        it("return 201 when created userGroup but user updateOne fails", function(done) {
            authenticateUser(testUser, testToken, function() {
                dbCollections.users.findOne.onCall(0).callsArgWith(1, null, null);
                dbCollections.users.findOne.onCall(1).callsArgWith(1, null, testUser);
                dbCollections.users.insertOne.callsArgWith(1, null, null);
                dbCollections.conversations.insertOne.callsArgWith(1, null, {insertedId: "3sf9wdhf928g92fygf"});
                dbCollections.users.updateOne.callsArgWith(2, {err: "usernot added here either"}, null);
                request({url: requestUrl + "dikemou", jar: cookieJar, method: "POST",
                            headers: {"Content-type": "application/json"},
                            body: JSON.stringify({creator: "bob", participants: ["bob", "nikos"]})},
                function(error, response, body) {
                    assert(response.statusCode, 201);
                    done();
                });
            });
        });
    });
    describe("PUT api/group/:groupId", function () {
        const requestUrl = baseUrl + "/api/group/";
        it("return 401 when unauthorized", function(done) {
            dbCollections.users.updateOne.callsArgWith(2, null, null);
            request({url: requestUrl + "dikemou", method: "PUT"}, function(error, response, body) {
                assert(response.statusCode, 401);
                done();
            });
        });
        it("return 200 when updated", function(done) {
            dbCollections.users.updateOne.callsArgWith(2, null, null);
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl + "dikemou", jar: cookieJar, method: "PUT",
                            body: JSON.stringify({name: "adada"})},
                function(error, response, body) {
                    assert(response.statusCode, statusCodes.ok);
                    done();
                });
            });
        });
        it("return 500 when mongo trouble", function(done) {
            dbCollections.users.updateOne.callsArgWith(2, {err: "dikemou lathos"}, null);
            authenticateUser(testUser, testToken, function() {
                request({url: requestUrl + "dikemou", jar: cookieJar, method: "PUT",
                            body: JSON.stringify({name: "adada"})},
                function(error, response, body) {
                    assert(response.statusCode, statusCodes.intServErr);
                    done();
                });
            });
        });
    });
    describe("establish connection with the web socket", function() {
        const requestUrl = baseUrl;
        const wsUrl      = baseUrl.replace("http", "ws");
        it("ping pong authenticated", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.users.findOne.callsArgWith(1, null, testUser);
                dbCollections.users.updateOne.callsArgWith(2, null, null);
                var ws = new WebSocket(wsUrl, {
                    headers: {"Cookie": "sessionToken=" + testToken}
                });
                ws.on("message", function(event) {
                    console.log(event);
                    request({url: requestUrl + "/api/user/undefined/bob",
                        jar: cookieJar, method: "PUT"}, function(error, response2) {
                        ws.close();
                        assert(ws, null);
                        if (event === "\"all\"") {
                            done();
                        }
                    });
                });
            });
        });
        it("ping pong UNauthenticated", function(done) {
            var ws = new WebSocket(wsUrl);
            ws.on("message", function(event) {
                console.log(event);
            });
            ws.on("close", function(event) {
                done();
            });
        });
    });
});
