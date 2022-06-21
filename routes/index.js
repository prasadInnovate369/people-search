const express = require("express");
const router = express.Router();
const users = require("./users");
const migration = require("./migration");
const people = require("./people");
const companies = require("./companies");
const search = require("./search");
// const contact = require("./contact");

router.use("/users", users);
router.use("/migration", migration);
router.use("/people", people);
router.use("/companies", companies);
router.use("/search", search);
// router.use("/contact", contact);

module.exports = router;
