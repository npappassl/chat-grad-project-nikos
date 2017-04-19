var express = require("express");
const request = require("request");
var createServer = require("../server/server");
var webdriver = require("selenium-webdriver");
var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");
const sinon = require("sinon");
//------- I added this so that webpack is instantiated -------------------------
const isDeveloping = process.env.NODE_ENV !== "production";
const webpack = require("webpack");
const webpackMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const config = require("../webpack.config.js");
//------------------------------------------------------------------------------

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

var driver;
var router;
var server;
var db;
var dbCollections;
var githubAuthoriser;
const oauthClientId = "1234clientId";

let middleware = [];
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

module.exports.setupDriver = function() {
    console.log("driver was set up");
    driver = new webdriver.Builder().usingServer().withCapabilities().forBrowser("chrome").build();
};
var cookieJar;

module.exports.setupServer = function(done) {

    router = express.Router();
    if (gatheringCoverage) {
        router.get("/bundle.js", function(req, res) {
            var absPath = path.join(__dirname, "build", "bundle.js");
            console.log(absPath);
            res.send(instrumenter.instrumentSync(fs.readFileSync("build/bundle.js", "utf8"), absPath));
        });
    }
    cookieJar = request.jar();
    dbCollections = {
        users: {
            find: sinon.stub(),
            findOne: sinon.stub(),
            insertOne: sinon.spy(),
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
    // server(testPort, db, githubAuthoriser, middleware)
    server = createServer(testPort, db, githubAuthoriser, middleware, router);
    // done();
};

module.exports.authenticateUser = function (user, token, callback) {
    sinon.stub(githubAuthoriser, "authorise", function(req, authCallback) {
        authCallback(user, token);
    });

    dbCollections.users.findOne.callsArgWith(1, null, user);

    request(baseUrl + "/oauth", function(error, response) {
        cookieJar.setCookie(request.cookie("sessionToken=" + token), baseUrl);
        callback();
    });
};

module.exports.teardownServer = function(done) {
    server.close(done);
};

module.exports.teardownDriver = function() {
    if (gatheringCoverage) {
        driver.executeScript("return __coverage__;").then(function (coverage) {
            collector.add(coverage);
        });
    }
    driver.quit();
};

module.exports.reportCoverage = function() {
    if (gatheringCoverage) {
        fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
    }
};

module.exports.navigateToSite = function() {
    console.log("driver", driver);
    return driver.get(baseUrl);
};
module.exports.getTitleText = function() {
    return driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getInputText = function() {
    var newTodo = driver.findElement(webdriver.By.id("new-todo"));
    driver.wait(webdriver.until.elementIsVisible(newTodo), 5000);
    return newTodo.getAttribute("value");
};

module.exports.getErrorText = function() {
    var errorElement = driver.findElement(webdriver.By.id("error"));
    driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"), 5000);
    return errorElement.getText();
};

module.exports.getLabelText = function() {
    var labelElement = driver.findElement(webdriver.By.id("count-label"));
    driver.wait(webdriver.until.elementTextContains(labelElement, "have"), 5000);
    return labelElement.getText();
};

module.exports.getTodoList = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    return driver.findElements(webdriver.By.css("#todo-list li"));
};

module.exports.getTodoListLabels = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    return driver.findElements(webdriver.By.css("#todo-list li label"));
};

module.exports.addTodo = function(text) {
    var newTodo = driver.findElement(webdriver.By.css("#new-todo"));
    var submitTodo = driver.findElement(webdriver.By.id("submit-todo"));
    driver.wait(webdriver.until.elementIsVisible(newTodo), 5000);
    driver.wait(webdriver.until.elementIsVisible(submitTodo), 5000);
    newTodo.sendKeys(text);
    submitTodo.click();
};
module.exports.deleteTodo = function(index) {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    var delBut = driver.findElement(webdriver.By.id("del" + index));
    delBut.click();
};
module.exports.completeTodo = function(index) {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    var complBut = driver.findElement(webdriver.By.id("compl" + index));
    complBut.click();
};
module.exports.deleteCompletedTodos = function() {
    var deleteCompleteBut = driver.findElement(webdriver.By.id("delComplete"));
    driver.wait(webdriver.until.elementIsVisible(deleteCompleteBut), 5000);
    deleteCompleteBut.click();
};
module.exports.isUndoSpanVisible = function() {
    var undoSpan = driver.findElement(webdriver.By.id("undoSpan"));
    driver.wait(webdriver.until.elementTextContains(undoSpan, "You just"), 5000);
};
module.exports.isDeleteCompleteNotVisible = function() {
    var deleteCompleteBut = driver.findElement(webdriver.By.id("delComplete"));
    driver.wait(webdriver.until.elementIsNotVisible(deleteCompleteBut), 5000);
    return true;
};
module.exports.setupErrorRoute = function(action, route) {
    if (action === "get") {
        router.get(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "post") {
        router.post(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "DELETE") {
        router.delete(route, function(req, res) {
            res.sendStatus(404);
        });
    }
};
