const express = require("express");
const router = express.Router();

const {
  getAllPeopleList,
  getPublicationsList,
  getPeopleInfo,
} = require("../controllers/people");

router.get("/", getAllPeopleList);
router.get("/publications", getPublicationsList);
router.get("/details/:id", getPeopleInfo);

module.exports = router;
