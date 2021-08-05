# TinyApp Project
An app that creates and keeps track of a user's shortened URLs (reminescent of bit.ly). Users can edit and delete their stored URLs and they can also re-use their shortened links for sharing purposes (more memes to send, amirite?). 

This app uses bcrypt, cookieSession, JavaScript, Node.js, ExpressJS, EJS, and HTML.

## Final Product

!["Screenshot when making a new shortened URL"](https://github.com/diannegabriel/tinyapp/blob/master/docs/urls_new.png)

!["Screenshot of a shorten URL page"](https://github.com/diannegabriel/tinyapp/blob/master/docs/urls_shortURL.png)

!["Screenshot of URLs page"](https://github.com/diannegabriel/tinyapp/blob/master/docs/urls_page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Tune in to `localhost:8080` on your browser

## How To Use TinyApp

In order to generate and store shorten links, users must create an account and log in to have full access to the links. Once logged in, users can modify their links by editing or deleting them.

### Register

At the landing page, simply click 'Register' on the top right side of the app. Enter a valid email and password. You should be automatically logged in as soon as you create an account.

### Login

Already registered an account? No problem! Right beside 'Register' is the 'Login' button. Simply click it, enter your email and password, and it should directly lead you to your collections of URLs.

### Generate New Links

To create a new shorten link, click on 'Create New URL' on the top left side of the app. Enter a valid URL that you would like to shorten and click 'Submit'. Your new link is now available to use!

### Modify Links

Made a mistake? Or you don't need a specific link anymore? No problem! Modify your URLs by clicking 'Edit' to update the original URL or simply click 'Delete' if you no longer need it. Remember, you must be logged in in order to modify your links. Other users will not have access to your URLs, just you!

### Using and Sharing

While other users cannot access your links, you can still share it! To use your link, just click on the shorten URL and it should redirect you to the original website. To share it, simply copy: `localhost:8080/u/:shortURL` and paste it anywhere you like! Anyone who clicks on this link will be redirected to the original website.

Have fun! 
