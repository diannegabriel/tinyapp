const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  shortURLChecker
} = require('./helpers');

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Middleware setup
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['purple-delicious-icecream-lover']
}));

//=============================EXAMPLE DATA=================================

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  }
};

const users = {
  "aJ48lW": {
    userID: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple", 10)
  }
};

//=============================LANDING PAGE================================

// Redirects to /urls
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

//==============================GET /urls==================================
//=============================POST /urls==================================

// TinyApp front page and landing page
// Renders urls_index.ejs template
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  const userURLs = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: userURLs,
    user: users[userID],
  };
  res.render("urls_index", templateVars);
});

/*
* Shows a list of the user's links
* Shows Edit and Delete buttons
* urlsForUser returns the user's urls from the database in an object
* generateRandomString is used to get a unique shortURL ID
*/
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL,
      userID: req.session.user_id,
    };
    return res.redirect(`/urls/${shortURL}`);
  }
  res.status(400).send("<center><h1>400 Error! Cannot access this page</h1></center>\n");
});

//=============================GET /urls/new=================================

/*
* Account holder generates a new shortURL
* This page can only be accessed if logged in
* Redirects to the login page if no user is logged in
*/
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id],
    };
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

//=========================GET /urls/:shortURL===============================

// Shows more details about a specific shortURL
// shortURLChecker checks if shortURL is in the database
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: userURLs,
    user: users[userID],
    shortURL: req.params.shortURL,
    validShortURL: shortURLChecker(req.params.shortURL, urlDatabase),
  };
  res.render("urls_show", templateVars);
});

//===========================GET /u/:shortURL================================

/*
* Redirects anyone to the longURL
* This link must be accessible to anyone,
* regardless if they have an account or not
* shortURLChecker checks if that shortURL is in the database
*/
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!shortURLChecker(shortURL, urlDatabase)) {
    return res.redirect(`/urls/:${shortURL}`);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//===========================POST /urls/:id==================================

// Edits the user's shortURL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.editedURL;
  }
  res.redirect(`/urls`);
});

//======================POST /urls/:shortURL/delete==========================

/*
* Deletes the user's shortURL
* To verify that no one else can delete shortURLs,
* type 'curl -X POST -i localhost:8080/urls/b6UTxQ/delete' in the terminal
* Using the browser will result to: Cannot GET /urls/b6UTxQ/delete
*/
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }
  res.status(403).send("403 Error. Cannot access this page.\n");
});

//==============================GET /login===================================
//=============================POST /login===================================

// Renders urls_login template. Shows two input forms for email and password
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

/*
* Logs the user in with valid email and password
* Returns 404 error if email is not found in the database
* Returns 403 error if password is wrong
*/
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);

  if (!user) {
    return res.status(404).send("<center><h1>404 Error: E-mail is not found.</h1></center>\n");
  }

  // Ensures hashed password and typed password match
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send("<center><h1>403 Error: Wrong password.</h1></center>\n");
  }
  
  req.session.user_id = user.userID;
  res.redirect("/urls");
});

//============================POST /logout==================================

// Logs the user out and clears all related cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//============================GET /register=================================
//===========================POST /register=================================

// Renders urls_register template. Shows two input forms for email and password
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_register", templateVars);
});

/*
* Registers a new user
* Password is being hashed for client and server's safety
* Returns 404 error if either email and/or password are invalid
* Returns 409 error if email is already in the databse
*/
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("<center><h1>404 Error. Please enter a valid e-mail and password.</h1></center>\n");
  }

  if (getUserByEmail(req.body.email, users)) {
    return res.status(409).send("<center><h1>409 Error. E-mail already registered.</h1></center>\n");
  }

  const userID = generateRandomString();
  users[userID] = {
    userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});

//=============================LISTEN PORT===============================

// Server listens
app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});