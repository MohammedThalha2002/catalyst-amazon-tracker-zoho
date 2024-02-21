const express = require("express");
const cors = require("cors");
const router = require("./routes/router");
var bodyParser = require("body-parser");
// require("./config/db");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", router);

module.exports = app;
