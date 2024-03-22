const express = require('express');
const app = express();
const PORT = 3000; // default port 3000
const users = require('./data/userData');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { findUserByEmail, urlsForUser, generateRandomString } = require('./helpers')
const { urlDatabase } = require('./data/userData')


//RENDER CONFIGURATION
app.set("view engine", "ejs");

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieSession({
  name:'session',
  keys: ['thelqwrhjlq']
}));

//APP ROUTE HANDLING
//redirects to home page
app.get("/", (req, res) => {
  if(!req.session.user_id){
    return res.redirect("/login");
  } res.redirect("/urls");
});

//shows url database in json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//homepage or landing page
app.get("/urls", (req, res) => {
  let userid = req.session.user_id
  urls = urlsForUser(userid, urlDatabase);
  const templateVars = { user: req.session.user_id, urls: urls, email: req.session.email};
  res.render("urls_index", templateVars);
});

//create a new short url page
app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.session.user_id, email: req.session.email};
  //if user is not logged in redirect to login
  if(!req.session.user_id){
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars)
});

//shows us short url, as well as option to edit long url page
app.get("/urls/:id", (req, res) => {
  //if user is not logged in, returns html error message
  if(!req.session.user_id) {
    return res.status(404).send("You must be logged in to view this page");
  }
  if(urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("This url does not belong to you")
  }
  const templateVars = { user: req.session.user_id, id: req.params.id, longURL: urlDatabase[req.params.id].longURL, email: req.session.email, userid: urlDatabase[req.params.id].userID};
  res.render("urls_show", templateVars);
});

//creates new short url for long url entered
app.post("/urls", (req, res) => { 
  //if user is not logged in, returns html error message
  if(!req.session.user_id){
    return res.send("You must be logged in to submit a URL");
  }
  //if longURL input is left empty, returns html error message
  if (req.body.longURL === "") {
    return res.send("Please enter a valid URL");
  }
  const body = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: body, userID: req.session.user_id};
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
  if(urlDatabase[req.params.id].userID !== req.session.user_id){
    return res.send("You are not allowed to delete this link.");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


//updates short url with new long url
app.post("/urls/:id", (req, res) => {
  //if userid attached to short url is not the same as logged in user, returns html error message
  if(urlDatabase[req.params.id].userID !== req.session.user_id){
    return res.send("You are not allowed to update this link.");
  }
  urlDatabase[req.params.id].longURL = req.body.updatedURL;
  res.redirect("/urls");
});

//checks user info for login
app.post("/login", (req, res) => {
  //if email is incorrect, returns html error message
  if(!findUserByEmail(req.body.email, users)){
    return res.status(403).send("Invalid email or password");
  }
  let userid = findUserByEmail(req.body.email, users);
  //if password is incorrect, returns html error message
  if (!bcrypt.compareSync(req.body.password, users[userid].password)) {
    return res.status(403).send("Invalid email or password");
  }
  req.session.user_id = userid;
  req.session.email = req.body.email;
  res.redirect("/urls");
});

//logs out user
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//register page
app.get("/register", (req, res) => {
  //checks if user is logged in
  if(req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: req.session.user_id, email: req.session.email};
  res.render("register", templateVars);
})

//registers user
app.post("/register", (req, res) => {
  //checks if email or password input is undefined or empty
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Invalid email and/or password");
  }
  //checks if email exists, if not; registers user
  if (!findUserByEmail(req.body.email, users)) {
  userID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password,10);
  users[userID] = { id: userID,
                    email: req.body.email,
                    password: hashedPassword
                  };
  req.session.user_id = userID;
  req.session.email = users[userID].email;
  res.redirect("/urls");
  } else {
    return res.status(400).send("Email already exists");
  } 
});

//login page
app.get("/login", (req, res) => {
  const templateVars = { user: req.session.user_id, email: req.session.email};
  //checks if user is logged in already
  if(req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars)
});

//server listening for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
