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

const testUser = {
    _id: "bob",
    name: "Bob Bilson",
    avatarUrl: "http://avatar.url.com/u=test"
};
const testUser2 = {
    _id: "charlie",
    name: "Charlie Colinson",
    avatarUrl: "http://avatar.url.com/u=charlie_colinson"
};
const testGithubUser = {
    login: "bob",
    name: "Bob Bilson",
    avatar_url: "http://avatar.url.com/u=test"
};
const testToken = "123123";
const testExpiredToken = "987978";
const testMessage1 = {
    userTo: "nikos",
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
    messages: testMessages
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
                colors: true,
                hash: false,
                timings: true,
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
                insertOne: sinon.spy()
            },
            messages: {
                find: sinon.stub(),
                findOne: sinon.stub(),
                insertOne: sinon.spy()
            },
            conversations: {
                find: sinon.stub(),
                findOne: sinon.stub(),
                insertOne: sinon.spy()
            }
        };
        db = {
            collection: sinon.stub()
        };
        db.collection.withArgs("users").returns(dbCollections.users);
        db.collection.withArgs("messages").returns(dbCollections.messages);
        db.collection.withArgs("conversations").returns(dbCollections.conversations);

        githubAuthoriser = {
            authorise: function() {},
            oAuthUri: "https://github.com/login/oauth/authorize?client_id=" + oauthClientId
        };
        serverInstance = server(testPort, db, githubAuthoriser, middleware);
    });
    afterEach(function() {
        serverInstance.close();
    });
    function authenticateUser(user, token, callback) {
        sinon.stub(githubAuthoriser, "authorise", function(req, authCallback) {
            authCallback(user, token);
        });

        dbCollections.users.findOne.callsArgWith(1, null, user);

        request(baseUrl + "/oauth", function(error, response) {
            cookieJar.setCookie(request.cookie("sessionToken=" + token), baseUrl);
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
                    subscriptionRequests: [],
                    subscribedTo: []
                });
                done();
            });
        });
    });
    describe("GET /api/oauth/uri", function() {
        var requestUrl = baseUrl + "/api/oauth/uri";
        it("responds with status code 200", function(done) {
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
            authenticateUser(testUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with a body that is a JSON object if user is authenticated", function(done) {
            authenticateUser(testUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar}, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body), {
                        _id: "bob",
                        name: "Bob Bilson",
                        avatarUrl: "http://avatar.url.com/u=test"
                    });
                    done();
                });
            });
        });
        it("responds with status code 500 if database error", function(done) {
            authenticateUser(testUser, testToken, function() {

                dbCollections.users.findOne.callsArgWith(1, {err: "Database error"}, null);

                request({url: requestUrl, jar: cookieJar}, function(error, response) {
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
            authenticateUser(testUser, testToken, function() {
                allUsers.toArray.callsArgWith(0, null, [testUser]);

                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with a body that is a JSON object if user is authenticated", function(done) {
            authenticateUser(testUser, testToken, function() {
                allUsers.toArray.callsArgWith(0, null, [
                        testUser,
                        testUser2
                    ]);

                request({url: requestUrl, jar: cookieJar}, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body), [
                        {
                            id: "bob",
                            name: "Bob Bilson",
                            avatarUrl: "http://avatar.url.com/u=test"
                        },
                        {
                            id: "charlie",
                            name: "Charlie Colinson",
                            avatarUrl: "http://avatar.url.com/u=charlie_colinson"
                        }
                    ]);
                    done();
                });
            });
        });
        it("responds with status code 500 if database error", function(done) {
            authenticateUser(testUser, testToken, function() {
                allUsers.toArray.callsArgWith(1, {err: "Database failure"}, null);
                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
    });
    describe("POST api/message", function() {
        var requestUrl = baseUrl + "/api/message/";
        var conversation;
        var conversationInster;
        beforeEach(function() {
            conversation = sinon.stub();
            dbCollections.conversations.findOne.returns(conversation);
        });
        it("responds with status code 401 if user not authenticated", function(done) {
            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with 200 if message posted -- old conversation", function(done) {
            const obj = {
                conversationId: "58d52c27983d681738f5449e",
                userFrom: "nikos",
                userTo: "bob",
                msg: "ela re twra"
            };
            authenticateUser(testUser, testToken, function() {

                conversation.callsArgWith(1, {_id: new ObjectID("58d52c27983d681738f5449e")}, testConversation);
                request({
                    url: requestUrl, jar: cookieJar,
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(obj)
                }, function(error, response, body) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with 200 if message posted -- new conversation", function(done) {
            authenticateUser(testUser, testToken, function() {
                conversation.callsArgWith(1, null, testConversation);
                request({url: requestUrl, jar: cookieJar,
                    method: "POST", headers: {
                        "Content-type": "application/json"
                    }
                }, function(error, response, body) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
    });
    describe("GET api/conversations/:userId", function() {
        var requestUrl = baseUrl + "/api/conversations/" + testUser._id;

        var conversation;
        var bobUser;
        beforeEach(function() {
            bobUser = sinon.stub();
            conversation = {
                toArray: sinon.stub()
            };
            dbCollections.users.findOne.returns(bobUser);
            dbCollections.conversations.find.returns(conversation);
        });
        it("returns all conversation from specific user",  function (done) {
            authenticateUser(testUser, testToken, function() {
                bobUser.callsArgWith(0, testUser._id, testUser);
                conversation.toArray.callsArgWith(0, null, [testConversation]);
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(1, JSON.parse(body).length);
                    done();
                });
            });
        });
        it("returns 500 when conversations find errors ",  function (done) {
            authenticateUser(testUser, testToken, function() {
                bobUser.callsArgWith(0, testUser._id, testUser);
                conversation.toArray.callsArgWith(1, {err: "Database error"}, null);
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(500, response.statusCode);
                    done();
                });
            });
        });
        it("returns 404 when userId is undefined",  function (done) {
            requestUrl = baseUrl + "/api/conversations/undefined";
            authenticateUser(testUser, testToken, function() {
                bobUser.callsArgWith(0, testUser._id, testUser);
                conversation.toArray.callsArgWith(0, null, [testConversation]);
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(404, response.statusCode);
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
            authenticateUser(testUser, testToken, function() {
                dbCollections.conversations.findOne.callsArgWith(1, null, testConversation);
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    console.log(body);
                    assert.equal(2, JSON.parse(body).messages.length);
                    done();
                });
            });
        });
        it("returns 404 when no reqParams -- null", function(done) {
            requestUrl = baseUrl + "/api/conversation/null";
            authenticateUser(testUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(404, response.statusCode);
                    done();
                });
            });
        });
        it("returns 404 when no reqParams -- undefined", function(done) {
            requestUrl = baseUrl + "/api/conversation/undefined";
            authenticateUser(testUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(404, response.statusCode);
                    done();
                });
            });
        });
        it("returns 500 when conversation findOne errors", function(done) {
            requestUrl = baseUrl + "/api/conversation/58d52c27983d681738f5449e";
            dbCollections.conversations.findOne.callsArgWith(1, {err: "Database error"}, null);
            authenticateUser(testUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "GET"}, function(error, response, body) {
                    assert.equal(500, response.statusCode);
                    done();
                });
            });
        });
    });
    describe("establish connection with the web socket", function() {
        const requestUrl = baseUrl.replace("http", "ws");
        beforeEach(function() {
            var ws = new WebSocket(requestUrl);
            ws.on("message", function(event) {
                console.log(event);
                ws.close();
            });
        });
        it("ping pong", function(done) {
            authenticateUser(testUser, testToken, function() {
                request({url: baseUrl, method: "GET", jar: cookieJar},
                            function(error, response, body) {
                    done();

                });
            });
        });
    });
});
