const express = require("express");
const router = express.Router();

const {
  getAllCompaniesList,
  getAllServiceFirms,
  getTotalCountCompanies,
  getAllServiceLines,
  addContactDetails,
  getCompanyInfo,
  getInsights,
} = require("../controllers/companies");

router.get("/list", getAllCompaniesList);
router.get("/details/:id", getCompanyInfo);
router.get("/service-firms", getAllServiceFirms);
router.get("/total-count", getTotalCountCompanies);
router.get("/service-lines", getAllServiceLines);
router.post("/add-contact/:id", addContactDetails);
router.get("/insights-news", getInsights);

module.exports = router;
