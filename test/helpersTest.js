const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');
const { urlsForUser } = require('../helpers.js');

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

const testDatabase = {
  'sajqw8': {
    longURL: "www.google.com",
    userID: "userRandomID"
  },
  "r2qw29": {
    longURL: "www.example.com",
    userID: "user2RandomID"
  }
}

const newDatabase = {
  "sajqw8": {
    longURL: "www.google.com"
  }
}

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });
});

describe('findUserByEmail', function() {
  it('should return false if there is no user with that email', function() {
    const user = findUserByEmail("example@example.com", testUsers)
    const expectedUserID = false;
    assert.strictEqual(user, expectedUserID);
  })
})

describe('urlsForUser', function() {
  it('should return a new url object assigned to the specific user', function () {
    //cant actually compare objects so we will use object keys-values instead
    const url = urlsForUser("userRandomID", testDatabase).longURL;
    const expectedUrl = newDatabase.longURL;
    assert.strictEqual(url, expectedUrl);
  })
})
