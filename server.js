"use strict";
const server = require("./server/server");
const oAuthGithub = require("./server/oauth-github");
const MongoClient = require("mongodb").MongoClient;

const port = process.env.PORT || 8080;
const dbUri = process.env.DB_URI || "mongodb://nikos:210889@ds129030.mlab.com:29030/chat-grad-project-nikos";
const oauthClientId = process.env.OAUTH_CLIENT_ID || "fa4a22095c46dfc1d832";
const oauthSecret = process.env.OAUTH_SECRET || "4bbf1b48173c3cbc35917fad9f94ef2b584cbaa4";
const isDeveloping = null;// = process.env.NODE_ENV !== "production";
const webpack = require("webpack");
const webpackMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const config = require("./webpack.config.js");

let middleware = [];

if (isDeveloping) {
    const compiler = webpack(config);
    middleware[0] = webpackMiddleware(compiler, {
        publicPath: config.output.publicPath,
        contentBase: config.devServer.contentBase,
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

MongoClient.connect(dbUri, function(err, db) {
    if (err) {
        console.log("Failed to connect to db", err);
        return;
    }
    var githubAuthoriser = oAuthGithub(oauthClientId, oauthSecret);

    console.log("Server running on port " + port);
    server(port, db, githubAuthoriser, middleware);
});
