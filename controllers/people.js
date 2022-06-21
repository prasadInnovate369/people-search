const res = require("express/lib/response");
const { getPeopleList, getPublicationList, getPeopleById } = require("../models/people");

const getAllPeopleList = async (req, res) => {
  try {
    const peopleList = await getPeopleList(req.query);
    res.send({
      msg: "People fetched successfully!",
      data: peopleList,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const getPublicationsList = async (req, res) => {
  try {
    const publicationList = await getPublicationList(req.query);
    res.send({
      msg: "Publication fetched successfully!",
      data: publicationList,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const getPeopleInfo = async (req, res) => {
  try {
    const peopleList = await getPeopleById(req.query, req.params.id);
    res.send({
      msg: "People info fetched successfully!",
      data: peopleList,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

module.exports = {
  getAllPeopleList,
  getPublicationsList,
  getPeopleInfo
};
