const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const charSelection = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const generateRandomString = (chars) => {
  let result = "";
  for (let i = 6; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const emailChecker = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true
    }
  }
  return false
}

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

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
  };
    console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  if (!shortURL || !longURL) {
    res.status(404).send("<center><h1>404 Error. Link not found!</h1></center");
    return
  }
  res.redirect(longURL);
})

app.get("/register", (req, res) => {
  // const templateVars;
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_register", templateVars);
})

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  // console.log(templateVars)
  res.render("urls_login", templateVars)
})

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const shortURL = generateRandomString(charSelection);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  // const templateVars = {
  //   shortURL, 
  //   longURL, 
    // user: users[req.cookies["user_id"]]
  // };
  // res.render("urls_show", templateVars);
  res.redirect(`/urls/${shortURL}`)
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.editedURL;
  res.redirect(`/urls/`)
})

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(urlDatabase)
  // console.log(req.params.shortURL)
  delete urlDatabase[req.params.shortURL];
  // const templateVars = { urls: urlDatabase };
  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  // const templateVars = {
  //   urls: urlDatabase,
  //   user: users[req.cookies["user_id"]]
  // }
  console.log(req.body)
  // res.cookie("user_id", users.userID[email]);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.clearCookie("user_id");
  res.clearCookie("user");
  // const templateVars = {
  //   urls: urlDatabase,
  //   user: users[req.cookies["user_id"]]
  // }
  // res.render("urls_index", templateVars);
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  // const userID = generateRandomString(charSelection);
  // console.log(users)
  
  // users[userID] = {
  //   userID,
  //   email: req.body.email,
  //   password: req.body.password
  // }

  if (req.body.email && req.body.password) {
    if (!emailChecker(req.body.email)) {
      const userID = generateRandomString(charSelection);
      
      users[userID] = {
        userID,
        email: req.body.email,
        password: req.body.password
      }

      res.cookie("user_id", userID);
      res.redirect("/urls");
    } else {
      res.status(400).send("<center><h1>400 Error. E-mail already registered.</h1></center");
    }
  } else {
    res.status(400).send("<center><h1>400 Error. Please enter a valid e-mail and password</h1></center");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});