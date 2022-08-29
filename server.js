const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const process = require("process");
const mongoose = require("mongoose");

const uri =
  "mongodb+srv://daru:daru@cluster0.jggoz.mongodb.net/BirthdayBot?retryWrites=true&w=majority";

mongoose
  .connect(uri)
  .then(() => console.log("connected to mongodb.."))
  .catch((err) => console.error("could not connect to mongodb", err));

// app configuration
app.set("port", process.env.PORT || 3000);
require("dotenv").config();

// setup express application
app.use(morgan("dev")); // log every request to the console.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app routes
require("./routes/verify-webhook")(app);

app.listen(app.get("port"), function () {
  const url = "http://localhost:" + app.set("port");
  console.log("Application running on port: ", app.get("port"));
});
