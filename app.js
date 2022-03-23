//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose')

const app = express()
const port = 5000

app.use(session({
  secret: "80AY#.,jz6BD5).'3NsktPjQy",
  resave: false,
  saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secretsDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}))

app.get('/', (req, res) => {
  res.render('home')
})
app.get('/login', (req, res) => {
  res.render('login')
})
app.get('/register', (req, res) => {
  res.render('register')
})

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('secrets');
  } else {
    res.redirect('/login');
  }
})

app.post('/register', (req, res) => {
  User.register({ username: req.body.username }, req.body.password, function (error, user) {
    if (error) {
      console.log(error);
      res.redirect('/register')
    } else {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/secrets');
      })
    }
  })
})

app.post('/login', (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  User.findOne({ email: email, password: password }, (error, results) => {
    if (error) {
      res.send(error);
    }

    if (!results) {
      res.send("No user with these details");

    }

    if (results) {
      res.render("secrets");
    }

  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})