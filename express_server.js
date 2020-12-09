// Creating Web Server with Express

const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const bcrypt = require("bcrypt");


app.set("view engine", "ejs");

// middelware
const cookieSession = require("cookie-session");
app.use(cookieSession ({
  name: 'session',
  keys: ['key1', 'key2']
}))

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// helper functions
function generateRandomString() {
  // example given in lecture
  return Math.random().toString(36).substring(2,8);
};

function isValid(input) {
  if(input) {
    return true;
  }
  return false;
}

// could probably refractor this like below
function isNewEmail(email) {
  for (let user in users) {
    let values = Object.values(users[user])
    if (values.includes(email)) {
      return false;
    }
  }
  return true;
}

function userIDFromEmail(email) {
  for (let user in users) {
    let values = Object.values(users[user])
    if (values.includes(email)) {
      return users[user].id;
    }
  }
  return false;
}

function passwordMatches(passwordEntered, userID) {
  let userPassHashed = users[userID].password
  if (bcrypt.compareSync(passwordEntered, userPassHashed)) {
    return true;
  }
  return false;
}

function urlsForUser(id) {
  let userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}
// can make  into a function to DRY up user verification for edit and delete
// let user_id_name = req.cookies["user_id"].id;
// let url_user = urlDatabase[req.params.shortURL].userID;
// if (user_id_name === url_user) {


// Databases
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "abc123"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "abc123"}
};

const users = {
  "abc123": {
    id: "abc123",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

// Routes to different pages
// Internal Pages
app.get("/", (req, res) => {
  res.send("Hello!<br>Welcome to my TinyApp Project.<br>Created by: Tammy Tran <br><a href='urls'>Enter Here!</a>");
});

app.get("/urls", (req,res) => {
  if(req.session.user_id){
    const urlList = urlsForUser(req.session.user_id.id)
    const templateVars = { user_id: req.session.user_id, urls: urlList};
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_index", {user_id: null});
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.session.user_id }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    user_id: req.session.user_id,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    // condition to see if user has access
    user_id_name: req.session.user_id.id,
    url_user: urlDatabase[req.params.shortURL].userID
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req,res) => {
  const templateVars = { user_id: req.session.user_id}
  res.render("urls_registration", templateVars);
})

app.get("/login", (req, res) => {
  const templateVars = { user_id: req.session.user_id}
  res.render("urls_login", templateVars)
})

// Internal Sample pages
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Internal link to external long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
})

// routes for events
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  const newLongURL = req.body.longURL;
  // updates urlDatabase
  urlDatabase[newShortURL] = {longURL: newLongURL, userID: req.session.user_id.id };
  res.redirect(`/urls/${newShortURL}`);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  let user_id_name = req.session.user_id.id;
  let url_user = urlDatabase[req.params.shortURL].userID;
  if (user_id_name === url_user) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send(`You do not have access!!!`)
  }
});

app.post("/urls/:shortURL", (req, res) => {
  let newLongURL = req.body.newLongURL;
  let user_id_name = req.session.user_id.id;
  let url_user = urlDatabase[req.params.shortURL].userID;
  if (newLongURL) {
    if (user_id_name === url_user) {
      urlDatabase[req.params.shortURL].longURL = newLongURL;
    } else {
      res.send(`You do to not have access!!!`)
    }
  } else {
    newLongURL = urlDatabase[req.params.shortURL].longURL
  }
  res.redirect(`/urls/${req.params.shortURL}`);
})

app.post('/register', (req,res) => {
  // collect user info from form
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const userPassHashed = bcrypt.hashSync(userPass, 10);
  // check if email and password is valid, then register
  if (isValid(userEmail) && isValid(userPass) && isNewEmail(userEmail)) {
    users[userID] = {
      id: userID,
      email: userEmail,
      password: userPassHashed
    }
    req.session.user_id = users[userID];
    res.redirect('/urls')
  } else {
    if(!isValid(userEmail) || !isValid(userPass)) {
      res.send("Status Code: 400. Email or password not entered.")
    } else {
      res.send("Status Code: 400. Email already in use")
    }
  }
})

// cookie management
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = userIDFromEmail(email)
  if(userID && passwordMatches(password,userID)) {
    // console.log(users)
    req.session.user_id = users[userID];
    res.redirect('/urls')
  } else {
    res.send("Status code: 403. Email cannot be found or password does not match")
  }
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls')
})

// server on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
