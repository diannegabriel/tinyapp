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

const emailChecker = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user]
    }
  }
  return undefined
}

const emailExist = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true
    }
  }
  return false
}

const urlsForUser = (id) => {
  let userURLs = {};
  
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = { 
  "aJ48lW": {
    userID: "aJ48lW", 
    email: "user@example.com", 
    password: "purple"
  }
}

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

//===/urls===

app.get("/urls", (req, res) => {
  // const templateVars = { 
  //   urls: urlDatabase, 
  //   user: users[req.cookies["user_id"]]
  // };
  const userID = req.cookies['user_id'];
  const userURLs = urlsForUser(userID);
  const templateVars = {
    urls: userURLs,
    user: users[userID]
  };
  // console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const shortURL = generateRandomString(charSelection);
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL,
      userID: req.cookies["user_id"]
    };
    return res.redirect(`/urls/${shortURL}`)
  }
  res.status(400).send("<center><h1>400 Error! Cannot access this page</h1></center>\n");
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = { 
      urls: urlDatabase, 
      user: users[req.cookies["user_id"]]
    };
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

app.get("/urls/:shortURL", (req, res) => {
  // const templateVars = { 
  //   longURL: urlDatabase[req.params.shortURL].longURL, 
  //   user: users[req.cookies["user_id"]]
  // };
  const userID = req.cookies['user_id'];
  const userURLs = urlsForUser(userID);
  const templateVars = {
    urls: userURLs,
    user: users[userID],
    shortURL: req.params.shortURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!shortURL || !longURL) {
    return res.status(404).send("<center><h1>404 Error. Link not found!</h1></center>\n");
  }
  res.redirect(longURL);
})

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  if (req.cookies["user_id"] === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.editedURL;
  }
  res.redirect(`/urls/${shortURL}`)
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  if (req.cookies["user_id"] === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
})

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars)
})

app.post("/login", (req, res) => {
  const user = emailChecker(req.body.email, users);

  if (user) {
    if (req.body.password === user.password) {
      res.cookie('user_id', user.userID);
      res.redirect("/urls");
    } else {
      console.log(req.body.password);
      console.log(user.password);
      res.status(400).send("<center><h1>400 Error. Wrong password</h1></center>\n")
    } 
  } else {
    res.status(400).send("<center><h1>400 Error. E-mail is not registered</h1></center>\n")
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_register", templateVars);
})

app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!emailExist(req.body.email)) {
      const userID = generateRandomString(charSelection);
      
      users[userID] = {
        userID,
        email: req.body.email,
        password: req.body.password
      }
      res.cookie("user_id", userID);
      res.redirect("/urls");
    } else {
      res.status(400).send("<center><h1>400 Error. E-mail already registered.</h1></center>\n");
    }
  } else {
    res.status(400).send("<center><h1>400 Error. Please enter a valid e-mail and password</h1></center>\n");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});