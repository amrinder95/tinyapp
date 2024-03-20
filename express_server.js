const express = require('express');
const app = express();
const cookies = require('cookie-parser');
const PORT = 8080; // default port 8080
const users = require('./data/userData')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookies());

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
  return null;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], urls: urlDatabase, userinfo: users };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], userinfo: users };
  console.log(users);
  res.render("urls_new", templateVars)
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], id: req.params.id, longURL: urlDatabase[req.params.id], userinfo: users };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => { 
  if (req.body.longURL === "") {
    res.send("Please enter a valid URL.")
    throw new Error("Invalid URL");
  }
  const body = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = body;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.user_id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  console.log(users);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies["user_id"]};
  res.render("register", templateVars);
})

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("Invalid email and/or password");
  }
  if (findUserByEmail(req.body.email) === null) {
  userID = generateRandomString();
  users[userID] = { id: userID,
                    email: req.body.email,
                    password: req.body.password
                  };
  res.cookie("user_id", userID);
  res.redirect("/urls");
  } else {
    res.status(400);
    res.send("Email already exists");
  } 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
