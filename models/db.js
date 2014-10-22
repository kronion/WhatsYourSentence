require('rootpath')();

module.exports = function(app, express) {

  var fs = require('fs');

  var mongoose = require('mongoose'),
      MongoStore = require('connect-mongo')(express);
  mongoose.connect('mongodb://localhost/WYS');

  /* Put all schemas in this dedicated file */
  var schemas = require('models/schemas.js')(mongoose);

  /* DB Settings */
  var settings = require('models/settings.js');

  app.use(express.cookieParser())
     .use(express.json())
     .use(express.urlencoded())
     .use(express.session({
       secret: settings.secret,
       key: 'sid',
       cookie: {
         secure: true
       },
       store: new MongoStore({
         mongoose_connection: mongoose.connection
       })
     }));
  return {
    schemas: schemas,
    connection: mongoose.connection
  }
}
