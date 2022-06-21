const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
require("dotenv").config();
const app = express();
app.set("view engine", "ejs");

app.use(express.json());
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
    type: "application/x-www-form-urlencoded",
  })
);
app.use(express.static(`${__dirname}/uploads`));
app.use(cors());

const router = require("./routes/index");

app.use("/api", router);

app.get('/app', (req, res) => {
  res.send("PeopleSearch - Version - 2.0.1")
})

app.listen(3001, () => console.log("Server running on port 3001!"));
