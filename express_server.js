const express = require('express');
const app = express();
const cookies = require('cookie-parser');
const PORT = 8080; // default port 8080
const users = require('./data/userData')
const bcrypt = require("bcryptjs");

const urlDatabase = {

};

//render settings
app.set("view engine", "ejs");

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookies());

//functions
//only shows urls for user with associated userid
const urlsForUser = function(userid) {
  let newDatabase = {};
  for (let user in urlDatabase) {
    if(urlDatabase[user].userID === userid)
    newDatabase[user] = {longURL: urlDatabase[user].longURL};
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

//filters users database using email
const findUserByEmail = function(email) {
  for (let user in users) {
    if(users[user].email === email) {
      return users[user];
    }
  }
  return false;
}

//redirects to home page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//shows url database in json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//homepage or landing page
app.get("/urls", (req, res) => {
  let userid = req.cookies["user_id"]
  let newDatabase = urlsForUser(userid);
  const templateVars = { user: req.cookies["user_id"], urls: newDatabase, email: req.cookies["email"]};
  res.render("urls_index", templateVars);
});

//create a new short url page
app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], email: req.cookies["email"]};
  //if user is not logged in redirect to login
  if(!req.cookies["user_id"]){
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars)
});

//shows us short url, as well as option to edit long url page
app.get("/urls/:id", (req, res) => {
  //if user is not logged in, returns html error message
  if(!req.cookies["user_id"]) {
    return res.send("You must be logged in to view this page");
  }
  const templateVars = { user: req.cookies["user_id"], id: req.params.id, longURL: urlDatabase[req.params.id].longURL, email: req.cookies["email"], userid: urlDatabase[req.params.id].userID};
  res.render("urls_show", templateVars);
});

//creates new short url for long url entered
app.post("/urls", (req, res) => { 
  //if user is not logged in, returns html error message
  if(!req.cookies["user_id"]){
    return res.send("You must be logged in to submit a URL");
  }
  //if longURL input is left empty, returns html error message
  if (req.body.longURL === "") {
    return res.send("Please enter a valid URL");
  }
  const body = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: body, userID: req.cookies["user_id"]};
  res.redirect(`/urls/${shortURL}`);
});

//redirects to long url using short url 
app.get("/u/:id", (req, res) => {
  //if invalid short url is provided, returns html error message
  if(urlDatabase[req.params.id] === undefined) {
    return res.send("Invalid short URL");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


//deletes short url from url database
app.post("/urls/:id/delete", (req, res) => {
  //if userid attached to short url is not the same as logged in user, returns html error message
  if(urlDatabase[req.params.id].userID !== req.cookies["user_id"]){
    return res.send("You are not allowed to delete this link.");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


//updates short url with new long url
app.post("/urls/:id", (req, res) => {
  //if userid attached to short url is not the same as logged in user, returns html error message
  if(urlDatabase[req.params.id].userID !== req.cookies["user_id"]){
    return res.send("You are not allowed to update this link.");
  }
  urlDatabase[req.params.id].longURL = req.body.updatedURL;
  res.redirect("/urls");
});

//checks user info for login
app.post("/login", (req, res) => {
  //if email is incorrect, returns html error message
  if(!findUserByEmail(req.body.email)){
    return res.status(403).send("Invalid email or password");
  }
  let userid = findUserByEmail(req.body.email).id;
  //if password is incorrect, returns html error message
  if (!bcrypt.compareSync(req.body.password, users[userid].password)) {
    return res.status(403).send("Invalid email or password");
  }
  res.cookie("user_id", userid);
  res.cookie("email", req.body.email);
  res.redirect("/urls");
});

//logs out user
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.clearCookie("email");
  res.redirect("/login");
});

//register page
app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], email: req.cookies["email"]};
  //checks if user is logged in
  if(req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("register", templateVars);
})

//registers user
app.post("/register", (req, res) => {
  //checks if email or password input is undefined or empty
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Invalid email and/or password");
  }
  //checks if email exists, if not; registers user
  if (!findUserByEmail(req.body.email)) {
  userID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password,10);
  users[userID] = { id: userID,
                    email: req.body.email,
                    password: hashedPassword
                  };
  res.cookie("user_id", userID);
  res.cookie("email", req.body.email);
  res.redirect("/urls");
  } else {
    return res.status(400).send("Email already exists");
  } 
});

//login page
app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], email: req.cookies["email"]};
  //checks if user is logged in already
  if(req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars)
});

//server listening for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
