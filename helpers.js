// helper functions

const bcrypt = require("bcrypt");

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
function isNewEmail(email, usersDatabase) {
  for (let user in usersDatabase) {
    let values = Object.values(usersDatabase[user])
    if (values.includes(email)) {
      return false;
    }
  }
  return true;
}

function userIDFromEmail(email, usersDatabase) {
  for (let user in usersDatabase) {
    let values = Object.values(usersDatabase[user])
    if (values.includes(email)) {
      return usersDatabase[user].id;
    }
  }
  return undefined;
}

function passwordMatches(passwordEntered, userID, usersDatabase) {
  let userPassHashed = usersDatabase[userID].password
  if (bcrypt.compareSync(passwordEntered, userPassHashed)) {
    return true;
  }
  return false;
}

function urlsForUser(id, urlDatabase) {
  let userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}

function userVerification(cookieID, databaseID) {
  let userID = cookieID.id;
  let url_userID = databaseID.userID;
  if(userID === url_userID) {
    return true;
  }
  return false;
}


module.exports = {
  generateRandomString,
  isValid,
  isNewEmail,
  userIDFromEmail,
  passwordMatches,
  urlsForUser,
  userVerification
}