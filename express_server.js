const express = require('express');
const app = express();
const cookies = require('cookie-parser');
const PORT = 8080; // default port 8080
const users = require('./data/userData')
const bcrypt = require("bcryptjs");

const urlDatabase = {

};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookies());

const urlsForUser = function(userid) {
  let newDatabase = {};
  for (let user in urlDatabase) {
    if(urlDatabase[user].userID === userid)
    newDatabase[user] = {longURL: urlDatabase[user].longURL};
  }
  return newDatabase;
}

const generateRandomString = function() {
  const all = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for(let i = 0; i < 6; i++) {
    randomString += all.charAt(Math.floor(Math.random() * all.length));
  }
  return randomString;
}

const findUserByEmail = function(email) {
  for (let user in users) {
    if(users[user].email === email) {
      return users[user];
    }
  }
  return false;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let userid = req.cookies["user_id"]
  let newDatabase = urlsForUser(userid);
  console.log(users);
  const templateVars = { user: req.cookies["user_id"], urls: newDatabase, email: req.cookies["email"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], email: req.cookies["email"]};
  if(!req.cookies["user_id"]){
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars)
});

app.get("/urls/:id", (req, res) => {
  if(!req.cookies["user_id"]) {
    res.send("You must be logged in to view this page")
    return;
  }
  const templateVars = { user: req.cookies["user_id"], id: req.params.id, longURL: urlDatabase[req.params.id].longURL, email: req.cookies["email"], userid: urlDatabase[req.params.id].userID};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => { 
  if(!req.cookies["user_id"]){
    res.send("You must be logged in to submit a URL");
    return;
  }
  if (req.body.longURL === "") {
    res.send("Please enter a valid URL")
    return;
  }
  const body = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: body, userID: req.cookies["user_id"]};
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  if(urlDatabase[req.params.id] === undefined) {
    res.send("Invalid short URL");
    return;
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if(urlDatabase[req.params.id].userID !== req.cookies["user_id"]){
    res.send("You are not allowed to delete this link.")
    return;
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if(urlDatabase[req.params.id].userID !== req.cookies["user_id"]){
    res.send("You are not allowed to update this link.")
    return;
  }
  urlDatabase[req.params.id].longURL = req.body.updatedURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  if(!findUserByEmail(req.body.email)){
    return res.status(403).send("Invalid email or password");
  }
  let userid = findUserByEmail(req.body.email).id;
  console.log(users[userid]);
  if (!bcrypt.compareSync(req.body.password, users[userid].password)) {
    return res.status(403).send("Invalid email or password");
  }
  res.cookie("user_id", userid);
  res.cookie("email", req.body.email);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.clearCookie("email");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], email: req.cookies["email"]};
  if(req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }
  res.render("register", templateVars);
})

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send("Invalid email and/or password");
    return;
  }
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
    res.status(400);
    res.send("Email already exists");
    return;
  } 
});

app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], email: req.cookies["email"]};
  if(req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
