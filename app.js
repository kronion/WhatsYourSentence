/*----------------------------------------------------------------------------*/
/* Filename: app.js                                                           */
/* Author: Collin Stedman                                                     */
/* Date: 10/5/14                                                              */
/*                                                                            */
/* This file is the "brain" of a generic web application written using        */
/* Node.js, Express 3.x, and MongoDB. Modify "to taste."                      */
/*----------------------------------------------------------------------------*/

/* Require files relative to application root */
require('rootpath')();

/* File system */
var fs = require('fs');

/* HTTP and HTTPS */
var http = require('http');
var https = require('https');

/* Unless otherwise specified, assume default web ports */
var httpPort = process.env.HTTP_PORT || 80;
var httpsPort = process.env.HTTPS_PORT || 443;

/* SSL files.
 * YOU MUST GENERATE THESE YOURSELF!
 * DON'T COMMIT ANY OF THESE FILES!
 * $ openssl genrsa -des3 -out server.key 1024
 * $ openssl req -new -key server.key -out server.csr
 * $ cp server.key server.key.org
 * $ openssl rsa -in server.key.org -out server.key
 * $ openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
 * $ vim pem_key
 * $ rm server.csr server.key.org */
var privateKey = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
var pem_key = fs.readFileSync('pem_key', 'utf8');
var credentials = {
  key: privateKey,
  cert: certificate,
  passphrase: pem_key
};

/* Express */
var express = require('express');
var app = module.exports = express();

/* Redirect HTTP to HTTPS */
app.use(function(req, res, next) {
  if (req.protocol == 'https') {
    next();
  }
  else {
    // Hacky fix for changing port number which assumes http port has 4 digits
    if (req.headers.host.slice(-4) === httpPort) {
      req.headers.host = req.headers.host.slice(0, -4) + httpsPort;
    }
    var new_url = 'https://' + req.headers.host + req.url;
    res.redirect(new_url);
  }
});

/* HSTS */
app.use(function(req, res, next) {
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return next();
});

/* Static file serving */
app.use(express.compress());
app.use(express.static(__dirname + '/public'));

/* Jade */
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals({
  title: 'Title'
});

/* DB and sessions */
var db = require('models/db.js')(app, express);
db.connection.on('error', function(e) {
  console.error('Mongoose connection error: ' + e);
});
db.connection.once('open', function() {
  
  /* Authentication methods */
  var auth = require('auth/auth.js')(app, db.schemas);
  app.post('/login', auth.login);
  app.get('/logout', auth.logout);
  app.post('/signup', auth.signup);

  /* User home */
  app.get('/user', function(req, res) {
    if (req.user) {
      res.render('home.jade', { user: req.user });
    }
    else {
      res.redirect('/');
    }
  });

  // Your code here
  var httpServer = http.createServer(app);
  var httpsServer =https.createServer(credentials, app);
  httpServer.listen(httpPort);
  httpsServer.listen(httpsPort);
});
