const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const process = require("process");
const mongoose = require("mongoose");

require("dotenv").config();

// connecting to database
const uri = process.env.DB_URI;
mongoose
  .connect(uri)
  .then(() => console.log("connected to mongodb.."))
  .catch((err) => console.error("could not connect to mongodb", err));

// setup express application
app.use(morgan("dev")); // log every request to the console.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app routes
require("./routes/verify-webhook")(app);

module.exports = app;
