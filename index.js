"use strict";

var path = require('path'),
  os = require('os'),

  express = require('express'),
  session = require('express-session'),

  // to store user session in mongodb
  // avoids entire memory usage for n number of users
  // different collections for it
  // right and safe way for production
  MongoDBStore = require('connect-mongodb-session')(session),
  favicon = require('serve-favicon'),
  bodyParser = require('body-parser'),
  helmet = require('helmet'),
  compression = require('compression'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  cookieParser = require('cookie-parser'),
  config = require('config'),  

  // import routes
  detailRoute = require('./routes/detailRoute'),
  registerRoute = require('./routes/registerRoute'),
  adminRoute = require('./routes/adminRoute'),

  // import error
  error = require('./middleware/error'),
  JWT = require('./middleware/jwtCheck')(),

  // setting port
  port = process.env.PORT || 3000,

  // MONGODB_URI
  MONGODB_URI = config.get('MONGODB_URI'),

  app = express();
  
// if something goes wrong outside express's context
// process.exit(1) ==> terminate the process
process.on("uncaughtException", function(ex){
  
  console.log(ex);
  process.exit(1);

});

process.on("unhandledRejection", function(ex){

  console.log(ex);
  process.exit(1);

});

// connect to mongodb
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
}).then(function () {
  console.log('Connected to', config.get('Name'), '!');
}).catch(function () {
  console.log('Couldn\'t connect to Mongodb!');
});
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);


// MongoDb session storage configuration
var store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'userSessions'
});

/*
 * middlewares
 *
 */
app.use(helmet());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
app.use(cookieParser());


app.use(compression()); // to make requests lighter and load faster
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// maxage for this middleware can be used  for cookie expiration ==> cookie: {maxAge: 3000 }
// store ==> stored in collection now
app.use(session({
  secret: 'my session secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

// morgan runs only in dev env
if (app.get('env') === 'development') {
  console.log(app.get('env'));
  app.use(morgan('common')); // console logger for dev only
  console.log('Morgan enabled...');
}

/*
 * routes
 *
 */

// register a user
app.use('/user', registerRoute);

// detailRoute
app.use('/api', detailRoute);

// admin
app.use('/api', adminRoute);

// error handling middleware
app.use(error);


var osDeatils = {
  platform: os.platform(),
  freemem: os.freemem(),
  networkInterfaces: os.networkInterfaces()
}

// listening @ port
app.listen(port, function () {
  console.log('listening at port', port); //osDeatils.platform, osDeatils.freemem, osDeatils.networkInterfaces
});