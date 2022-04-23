
var mongoose = require('./userData/model'),
  passport = require('passport'),
  express = require('express'),
  jwt = require('jsonwebtoken'),
  expressJwt = require('express-jwt'),
  router = express.Router(),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  request = require('request')
, TwitterStrategy = require('passport-twitter').Strategy
, session = require('express-session')
, cookieParser = require('cookie-parser')
, bodyParser = require('body-parser')
mongoose();

var User = require('mongoose').model('User');

var app = express();

// enable cors
var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

//rest API requirements
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/health-check',function(req, res) {
  res.status(200);
  res.send('Hello World');
});

var createToken = function(auth) {
  return jwt.sign({
    id: auth.id
  }, 'my-secret',
  {
    expiresIn: 60 * 120
  });
};

var generateToken = function (req, res, next) {
  req.token = createToken(req.auth);
  return next();
};

var sendToken = function (req, res) {
  res.setHeader('x-auth-token', req.token);
  return res.status(200).send(JSON.stringify(req.user));
};

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
  done(null, obj);
  });
  
  // Use the TwitterStrategy within Passport.
  
  passport.use(new TwitterStrategy({
  consumerKey: 'CibWrp9fTBJfEp7SFMWxVYAdQ',
  consumerSecret: 'ZL1I3RK4UkriHV14IgtQbjrY9mmMhOPBgoWd9n3kUD948N2Jlg',
  //callbackURL: config.callback_url
  },
  function(token, tokenSecret, profile, done) {
  process.nextTick(function () {
  //Check whether the User exists or not using profile.id
  if(config.use_database==='true')
  {
  //Perform MySQL operations.
  }
  });
  return done(null, profile);
  }
  ));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard-cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
  });
  
  app.get('/auth/twitter', passport.authenticate('twitter'));
  
  app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
  res.send({message:'Succesfully login'});
  });
  
  app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
  });
  
  function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
  }

var getCurrentUser = function(req, res, next) {
  User.findById(req.auth.id, function(err, user) {
    if (err) {
      next(err);
    } else {
      req.user = user;
      next();
    }
  });
};

var getOne = function (req, res) {
  var user = req.user.toObject();

  delete user['twitterProvider'];
  delete user['__v'];

  res.json(user);
};

  app.get('/auth/me', getCurrentUser);
  app.get('/auth/all', getOne);


app.use(router);

app.listen(4000);
module.exports = app;



console.log('Server running at http://localhost:4000/');