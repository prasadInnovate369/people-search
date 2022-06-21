const express = require("express");
const router = express.Router();

const { getAllSearch } = require("../controllers/users");
const { getProfSerivceFirm } = require("../controllers/users");

router.get("/", getAllSearch);

router.get("/getDropDownData", getProfSerivceFirm);
module.exports = router;
