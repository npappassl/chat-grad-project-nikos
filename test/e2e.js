var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");

const testGithubUser = {
    login: "bob",
    name: "Bob Bilson",
    avatar_url: "http://avatar.url.com/u=test"
};
const testUser = {
    _id: "bob",
    name: "Bob Bilson",
    avatarUrl: "http://avatar.url.com/u=test",
    subscribedTo: [],
    lastRead: {}
};
const testToken = "123123";

testing.describe("end to end", function() {
    this.timeout(20000);
    testing.before(helpers.setupDriver);
    testing.beforeEach(helpers.setupServer);
    testing.afterEach(helpers.teardownServer);
    testing.after(function() {
        helpers.teardownDriver();
        helpers.reportCoverage();
    });
    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.authenticateUser(testGithubUser, testToken, function(user, token) {
                console.log("user, token", user, token);
                helpers.navigateToSite();
                helpers.getTitleText().then(function(text) {
                    assert.equal(text, "TODO List");
                });
            });
        });
    });
});
