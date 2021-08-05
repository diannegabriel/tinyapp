// Generates random string for users and URLs
const generateRandomString = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = "";
  for (let i = 6; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Checks the email if it already exists in the database
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user]
    }
  }
  return undefined
}

// Collects the URL for a specific user
const urlsForUser = (id, database) => {
  let userURLs = {};
  
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userURLs[shortURL] = database[shortURL];
    }
  }
  return userURLs;
}

// Checks if the URL is valid
const shortURLChecker = (url, database) => {
  for (const shortURL in database) {
    if (shortURL == url) {
      return true
    }
  }
  return false
}

module.exports = { 
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  shortURLChecker
  };