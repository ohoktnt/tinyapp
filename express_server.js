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

// helper function
function generateRandomString() {
  // example given in lecture
  return Math.random().toString(36).substring(2,8);
};

// Databases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
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
}

// Routes to different pages
// Internal Pages
app.get("/", (req, res) => {
  res.send("Hello!\nWelcome to my TinyApp Project.\nCreated by: Tammy Tran");
});

app.get("/urls", (req,res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/register", (req,res) => {
  const templateVars = { username: req.cookies["username"]}
  res.render("urls_registration", templateVars);
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
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

// routes for events

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = newLongURL;
  res.redirect(`/urls/${newShortURL}`);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL", (req, res) => {
  let newLongURL = req.body.newLongURL;
  urlDatabase[req.params.shortURL] = newLongURL;
  res.redirect(`/urls/${req.params.shortURL}`);
})

app.post('/register', (req,res) => {
  // collect user info
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;
  // add user to database
  users[userID] = {
    id: userID,
    email: userEmail,
    password: userPass
  }
  console.log(users);
  res.cookie("user_id", userID);
  res.redirect('/urls')
})

// cookie management
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect('/urls')
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls')
})

// server on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
