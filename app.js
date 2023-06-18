




//jshint esversion:8
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const encrypt = require('mongoose-encryption');
const crypto = require('crypto');

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

console.log(process.env.API_KEY);

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const userRegister = new User({
    email: req.body.username,
    password: req.body.password,
  });
  userRegister
    .save()
    .then(() => {
      res.render("secrets");
    })
    .catch((error) => {
      console.error("Error saving user:", error);
      res.render("error", { message: "Error saving user" });
    });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username })
    .then((foundUser) => {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets"); // Render the "secrets" view
        } else {
          res.render("error", { message: "Incorrect password" });
        }
      } else {
        res.render("error", { message: "User not found" });
      }
    })
    .catch((error) => {
      console.error("Error finding user:", error);
      res.render("error", { message: "Error finding user" });
    });
});

app.listen(3000, function () {
  console.log("The server is currently running on port 3000");
});
