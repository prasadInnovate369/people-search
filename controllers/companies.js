const {
  getCompaniesList,
  getFirmsList,
  getTotalCount,
  getServiceLines,
  addContact,
  getCompanyById,
  getAllInsights,
} = require("../models/companies");

const getAllCompaniesList = async (req, res) => {
  const {
    page,
    size,
    search,
    noOfEmployee,
    type,
    location,
    name,
    serverOffered,
  } = req.query;
  const data = {
    page,
    size,
    search,
    noOfEmployee,
    type,
    location,
    name,
    serverOffered,
  };
  try {
    const companiesList = await getCompaniesList(data);
    res.send({
      msg: "Companies fetched successfully!",
      data: companiesList,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const getAllServiceFirms = async (req, res) => {
  try {
    const companiesList = await getFirmsList();
    return res.send({
      msg: "Service firms fetched successfully!",
      data: companiesList,
      status: 200,
    });
  } catch {
    res.send({ msg: e.message, status: 400 });
  }
};

const getTotalCountCompanies = async (req, res) => {
  try {
    const countList = await getTotalCount();
    res.send({
      msg: "Total count fetched successfully!",
      data: countList,
      status: 200,
    });
  } catch {
    res.send({ msg: e.message, status: 400 });
  }
};

const getAllServiceLines = async (req, res) => {
  try {
    const serviceLines = await getServiceLines(req.query);
    res.send({
      msg: "Service lines fetched successfully!",
      data: serviceLines,
      status: 200,
    });
  } catch {
    res.send({ msg: e.message, status: 400 });
  }
};

const addContactDetails = async (req, res) => {
  try {
    const addNewContact = await addContact(req.body, req.params.id);
    res.send({
      msg: "Contact Added successfully!",
      data: addNewContact,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const getCompanyInfo = async (req, res) => {
  try {
    const companyInfo = await getCompanyById(req.params.id, req.query);
    res.send({
      msg: "company data fetched successfully!",
      data: companyInfo,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const getInsights = async (req, res) => {
  try {
    const companyInfo = await getAllInsights(req.query);
    res.send({
      msg: "company news fetched successfully!",
      data: companyInfo,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

module.exports = {
  getAllCompaniesList,
  getAllServiceFirms,
  getTotalCountCompanies,
  getAllServiceLines,
  addContactDetails,
  getCompanyInfo,
  getInsights,
};
