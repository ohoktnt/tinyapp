// Creating Web Server with Express

const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const bcrypt = require("bcrypt");
const helper = require("./helpers.js");

app.set("view engine", "ejs");

// middelware
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// Databases
const urlDatabase = {};
const users = {};

// Routes to different pages
// Internal Pages
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
});
// main page
app.get("/urls", (req,res) => {
  if (req.session.user_id) {
    const urlList = helper.urlsForUser(req.session.user_id.id, urlDatabase);
    const templateVars = { user_id: req.session.user_id, urls: urlList};
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_index", {user_id: null});
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.session.user_id };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  // if the shortURL is in db
  if (helper.isURLInDB(req.params.shortURL, urlDatabase)) {
    const templateVars = {
      user_id: req.session.user_id,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user_id_name: null,
      url_user: null
    };
    // condition to see if user has access
    if (req.session.user_id) {
      templateVars.user_id_name = req.session.user_id.id;
      templateVars.url_user = urlDatabase[req.params.shortURL].userID;
    }
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("The Short URL code does not exist!");
  }
});

app.get("/register", (req,res) => {
  // if user already logged in
  if(req.session.user_id){
    res.redirect('/urls')
  }
  const templateVars = { user_id: req.session.user_id};
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  // if user already logged in
  if(req.session.user_id){
    res.redirect('/urls')
  }
  const templateVars = { user_id: req.session.user_id};
  res.render("urls_login", templateVars);
});

// Internal link to external long URL
app.get("/u/:shortURL", (req, res) => {
  if (helper.isURLInDB(req.params.shortURL, urlDatabase)) {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
  } else {
    res.status(404).send("The Short URL code does not exist!")
  }
});

// routes for events
app.post("/urls", (req, res) => {
  const newShortURL = helper.generateRandomString();
  const newLongURL = req.body.longURL;
  // updates urlDatabase
  urlDatabase[newShortURL] = {longURL: newLongURL, userID: req.session.user_id.id };
  res.redirect(`/urls/${newShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (helper.userVerification(req.session.user_id, urlDatabase[req.params.shortURL])) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } 
});

app.post("/urls/:shortURL", (req, res) => {
  let newLongURL = req.body.newLongURL;
  if (newLongURL) {
    if (helper.userVerification(req.session.user_id, urlDatabase[req.params.shortURL])) {
      urlDatabase[req.params.shortURL].longURL = newLongURL;
      res.redirect('/urls')
    } 
  } else {
    newLongURL = urlDatabase[req.params.shortURL].longURL;
  }
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/register', (req,res) => {
  // collect user info from form
  const userID = helper.generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const userPassHashed = bcrypt.hashSync(userPass, 10);
  // check if email and password is valid, then register
  if (helper.isValid(userEmail) && helper.isValid(userPass) && helper.isNewEmail(userEmail, users)) {
    users[userID] = {
      id: userID,
      email: userEmail,
      password: userPassHashed
    };
    req.session.user_id = users[userID];
    res.redirect('/urls');
  } else {
    if (!helper.isValid(userEmail) || !helper.isValid(userPass)) {
      res.status(400).send("Status Code: 400. Email or password not entered.");
    } else {
      res.status(400).send("Status Code: 400. Email already in use");
    }
  }
});

// cookie management
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = helper.userIDFromEmail(email, users);
  if (userID && helper.passwordMatches(password,userID,users)) {
    // console.log(users)
    req.session.user_id = users[userID];
    res.redirect('/urls');
  } else {
    res.send("Status code: 403. Email cannot be found or password does not match");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// default error page
app.get("*", (req, res) => {
  res.status(404).send("ERROR: 404!")
})

// server on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
