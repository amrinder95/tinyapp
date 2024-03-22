const urlDatabase = require('./data/userData').urlDatabase;

//filters users database using email
const findUserByEmail = function(email, database) {
  for (let user in database) {
    if(database[user].email === email) {
      return database[user].id;
    }
  }
  return false;
}

//only shows urls for user with associated userid
const urlsForUser = function(userid, database) {
  let newDatabase = {};
  for (let user in database) {
    if(database[user].userID === userid)
    newDatabase[user] = {longURL: database[user].longURL};
  }
  return newDatabase;
}

//generates random id 
const generateRandomString = function() {
  const all = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for(let i = 0; i < 6; i++) {
    randomString += all.charAt(Math.floor(Math.random() * all.length));
  }
  return randomString;
}

module.exports = {
  findUserByEmail,
  urlsForUser,
  generateRandomString
}