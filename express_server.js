// Creating Web Server with Express

const express = require("express");
const app = express();
const PORT = 3000; // default port 8080

app.set("view engine", "ejs");

// middelware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

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
  let userPass = users[userID].password
  if (passwordEntered === userPass) {
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
  if(req.cookies["user_id"]){
    const urlList = urlsForUser(req.cookies["user_id"].id)
    const templateVars = { user_id: req.cookies["user_id"], urls: urlList};
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_index", {user_id: null});
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    // condition to see if user has access
    user_id_name: req.cookies["user_id"].id,
    url_user: urlDatabase[req.params.shortURL].userID
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req,res) => {
  const templateVars = { user_id: req.cookies["user_id"]}
  res.render("urls_registration", templateVars);
})

app.get("/login", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"]}
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
  urlDatabase[newShortURL] = {longURL: newLongURL, userID: req.cookies["user_id"].id };
  res.redirect(`/urls/${newShortURL}`);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL", (req, res) => {
  let newLongURL = req.body.newLongURL;
  // when edit button is clicked on index page, the show page is render but missing the longURL
  if (newLongURL) {
    urlDatabase[req.params.shortURL].longURL = newLongURL;
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
  // check if email or password is valid, then register
  if (isValid(userEmail) && isValid(userPass) && isNewEmail(userEmail)) {
    users[userID] = {
      id: userID,
      email: userEmail,
      password: userPass
    }
    res.cookie("user_id", users[userID]);
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
    res.cookie("user_id", users[userID]);
    res.redirect('/urls')
  } else {
    res.send("Status code: 403. Email cannot be found or password does not match")
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.clearCookie("username")
  res.redirect('/urls')
})

// server on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
