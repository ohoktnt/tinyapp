// test/helpersTest.js

const { assert } = require('chai');
const bcrypt = require("bcrypt");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testURLS = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "abc123"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "abc123"},
  "9sd5xP": {longURL: "http://www.google.com", userID: "user2RandomID"}
};

const { userIDFromEmail } = require('../helpers');

describe('userIDFromEmail', () => {
  it('should return a user with valid email', () => {
    const user = userIDFromEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });
  it('should return undefined with invalid email', () => {
    const user = userIDFromEmail("tnt@example.com", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});

const { isNewEmail } = require('../helpers');

describe('isNewEmail', () => {
  it('should return true for a new email not in database', () => {
    const result = isNewEmail('tnt@example.com', testUsers);
    const expectedOutput = true;
    assert.strictEqual(result, expectedOutput);
  });
  it('should return false since email is already in database', () => {
    const result = isNewEmail('user@example.com', testUsers);
    const expectedOutput = false;
    assert.strictEqual(result, expectedOutput);
  });
});

const { passwordMatches } = require('../helpers');

describe('passwordMatches', () => {
  it('should return true for password input matching user database', () => {
    testUsers["userRandomID"].password = bcrypt.hashSync(testUsers["userRandomID"].password, 10);
    const result = passwordMatches("purple-monkey-dinosaur", "userRandomID", testUsers);
    const expectedOutput = true;
    assert.strictEqual(result, expectedOutput);
  });
  it('should return false for password input not matching user database', () => {
    testUsers["user2RandomID"].password = bcrypt.hashSync(testUsers["user2RandomID"].password, 10);
    const result = passwordMatches("password", "user2RandomID", testUsers);
    const expectedOutput = false;
    assert.strictEqual(result, expectedOutput);
  });
});

const { urlsForUser} = require('../helpers');

describe('urlsForUser', () => {
  it('should return object with urls with matching userID', () => {
    const result = urlsForUser("user2RandomID", testURLS);
    const expectedOutput = {"9sd5xP": {longURL: "http://www.google.com", userID: "user2RandomID"}};
    assert.deepEqual(result, expectedOutput);
  });
  it('should return undefined for invalid userID', () => {
    const result = urlsForUser('tnt', testURLS);
    const expectedOutput = {};
    assert.deepEqual(result, expectedOutput);
  });
});
