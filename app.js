const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const axios = require('axios');
var LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');
var session = require('express-session');
const passport = require('passport');
const app = express();
const config = require('./data/config.json');
const API_URL = config.api_url;
const bodyParser = require('body-parser');

app.get('/', (req, res) => {
  const currentUser = req.user || null;
  res.render('index', { currentUser });
});

let cachedMemes = [];

const fetchMemes = async () => {
  try {
    const response = await axios.get(API_URL);
    cachedMemes = response.data;
  } catch (error) {
    console.error('Error fetching memes:', error.message);
    cachedMemes = { memes: [] }; 
  }
};

fetchMemes();
app.get('/memes', (req, res) => {
  const currentUser = req.user || null;
  res.render('memes', { cachedMemes, currentUser });
});

app.get('/memes/search', (req, res) => {
  const searchQuery = req.query.query || ''; 
  const currentUser = req.user || null;

  if (searchQuery === '') {
    return res.render('memes', { cachedMemes: cachedMemes.memes, currentUser });
  }

  const filteredMemes = cachedMemes.memes.filter(meme =>
    meme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  res.render('memes', { cachedMemes: filteredMemes, currentUser });
});

app.get('/memes/:id', (req, res) => {
  const memeId = parseInt(req.params.id); 
  const meme = cachedMemes.memes.find(meme => meme.id === memeId);
  const currentUser = req.user || null;

  if (meme) {
    res.render('meme', { meme, currentUser });
  } else {
    res.status(404).send('Meme not found');
  }
});

app.use(session({
  secret: 'oasdhsadasd',
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null; 
  next();
});


require('./routes/passport-config')(passport);

app.get('/login', (req, res) => {
  const currentUser = req.user || null;
  res.render('login', { currentUser });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));


app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
