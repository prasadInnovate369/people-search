const db = require("../config/query");
const { param } = require("../routes/companies");

const getCompaniesList = async (data) => {
  const offset = (data.page - 1) * data.size;
  let orderQuery =
    " ORDER BY created_at DESC limit " + data.size + " OFFSET " + offset;
  let whereQuery = "";

  if (data.name) {
    whereQuery = ` AND name LIKE '%${data.name}%' `;
  }

  if (data.location) {
    whereQuery += `AND (state LIKE '%${data.location}%' OR city LIKE '%${data.location}%'
                       OR street LIKE '%${data.location}%') `;
  }

  if (data.type) {
    // whereQuery += `AND type LIKE '%${data.type}%' `;
  }

  if (data.noOfEmployee) {
    let numberRange = data.noOfEmployee.split("-");
    whereQuery += `AND no_of_employees >= ${numberRange[0]}  AND no_of_employees <= ${numberRange[1]} `;
  }

  if (data.serverOffered) {
    // whereQuery += `AND type LIKE '%${data.serverOffered}%' `;
  }

  try {
    const result = await db.query(
      "SELECT * FROM `companies` WHERE  status =  'active' " +
      whereQuery +
      orderQuery
    );

    const totalData = await db.query(
      "SELECT * FROM `companies` WHERE status = 'active'"
    );

    const totalItems = result.length;
    const totalPages = Math.ceil(totalData.length / data.size);
    const currentPage = Number(data.page);

    return { result, totalItems, totalPages, currentPage };
  } catch (e) {
    return e;
  }
};

const getFirmsList = async () => {
  try {
    const data = await db.query(
      "SELECT name , city, company_logo , type FROM `companies` WHERE status = 'active' ORDER BY created_at DESC limit 7"
    );

    return data;
  } catch (e) {
    return e;
  }
};

const getTotalCount = async () => {
  try {
    const companiesCount = await db.query(
      "SELECT name FROM `companies` WHERE status = ? ",
      ["active"]
    );

    const lawyersCount = await db.query(
      "SELECT first_name FROM `people` WHERE status = ? ",
      ["active"]
    );

    return {
      companiesCount: companiesCount.length,
      lawyersCount: lawyersCount.length,
      financialAdvisorCount: 0,
      transactionCount: 0,
    };
  } catch (e) {
    return e;
  }
};

const getServiceLines = async (data) => {
  let offset = (data.page - 1) * data.size;
  let limitQuery = " LIMIT " + data.size + " OFFSET " + offset;
  let whereQuery = " ON companies.id=service_lines.company_id ";
  if (data.name) {
    whereQuery +=
      " WHERE service_lines.service_offered  LIKE '%" + data.name + "%' ";
  }

  try {
    const serviceLines = await db.query(
      "SELECT * FROM service_lines JOIN companies " + whereQuery + limitQuery
    );

    return serviceLines;
  } catch (e) {
    return e;
  }
};

const addContact = async (contact, id) => {
  try {
    const { name, email, phNo, message, contactType, serviceLine } = contact;
    const newContactAdded = await db.query(
      "INSERT INTO contacts (name, email, phone_number, message, contact_id, contact_type,service_line)" +
      " VALUES (?,?,?,?,?,?,?)",
      [name, email, phNo, message, id, contactType, serviceLine]
    );
    return newContactAdded;
  } catch (error) {
    return error;
  }
};

const getCompanyById = async (id, data) => {
  const { detail_type, size, page, type, deal_size, location, industry_focus, industry_type, experience_role, orderBy, order } = data;
  try {
    if (detail_type == "overview") {
      const highlights = await db.query(
        `SELECT * FROM companies WHERE id = ${id}`
      );
      const highlight = highlights[0];

      const servicesOffered = await db.query(
        `SELECT service_lines.service_offered FROM service_lines JOIN companies ON companies.id = service_lines.company_id WHERE companies.id = ${id} `
      );

      const recentPublication = await db.query(
        `SELECT publications.title, publications.date, people.first_name, people.middle_name, people.last_name FROM ((people JOIN publications ON publications.people_Id = people.id) JOIN companies ON companies.id = people.company_id) WHERE companies.id = ${id} ORDER BY publications.created_at DESC`
      );
      return { highlight, servicesOffered, recentPublication };
    }

    if (detail_type == "people") {
      let offset = (page - 1) * size;
      let orderQuery = "";
      let defaultOrder = " ORDER BY `people`.created_at DESC ";
      let limitQuery = " limit " + size + " OFFSET " + offset;
      let whereQuery = `WHERE companies.id = ${id} `;
      let mainQuery = "";

      if (type) {
        whereQuery += ' AND  `people`.title LIKE "%' + type + '%" ';
      }

      if (location) {
        whereQuery += ` AND deal_postings.location LIKE '%${location}%' `;
      }

      if (deal_size) {
        whereQuery +=
          ' AND  deal_postings.deal_size LIKE "%' + deal_size + '%" ';
      }

      if (industry_focus) {
        whereQuery +=
          ' AND  deal_postings.deal_industry LIKE "%' +
          data.industry_focus +
          '%" ';
      }
      if (orderBy && order) {
        orderBy == "first_name"
          ? (orderQuery = "ORDER BY people." + orderBy + " " + order)
          : "";
        orderBy == "type"
          ? (orderQuery = "ORDER BY people.title " + order)
          : "";
        orderBy == "location"
          ? (orderQuery = "ORDER BY deal_postings.location " + order)
          : "";
        orderBy == "dealSize"
          ? (orderQuery = "ORDER BY deal_postings.deal_size " + order)
          : "";
        orderBy == "industryFocus"
          ? (orderQuery = "ORDER BY  deal_postings.deal_industry " + order)
          : "";
      }

      mainQuery = orderQuery
        ? "SELECT people.first_name,people.middle_name,people.last_name,people.title,deal_postings.location, deal_postings.deal_size, deal_postings.deal_industry FROM ((companies JOIN people ON companies.id = people.company_id) JOIN deal_postings ON deal_postings.user_id = people.id)" +
        whereQuery +
        orderQuery +
        limitQuery
        : "SELECT people.id AS people_id, CONCAT(people.first_name,' ',people.middle_name,' ',people.last_name ) AS full_name,people.title,deal_postings.location, deal_postings.deal_size, deal_postings.deal_industry FROM ((companies JOIN people ON companies.id = people.company_id) JOIN deal_postings ON deal_postings.user_id = people.id)" +
        whereQuery +
        defaultOrder +
        limitQuery;

      const result = await db.query(mainQuery);
      const totalData = await db.query(
        `SELECT people.id AS people_id, CONCAT(people.first_name,' ',people.middle_name,' ',people.last_name ) AS full_name,people.title,deal_postings.location, deal_postings.deal_size, deal_postings.deal_industry	FROM ((companies JOIN people ON companies.id = people.company_id) JOIN deal_postings ON deal_postings.user_id = people.id) WHERE companies.id = ${id} ` +
        defaultOrder
      );

      const totalItems = result.length;
      const totalPages = Math.ceil(totalData.length / size);
      const currentPage = Number(data.page);

      return { result, totalItems, totalPages, currentPage };
    }

    if (detail_type == "client_experience") {
      console.log('in this')
      let offset = (page - 1) * size;
      let orderQuery = "";
      let defaultOrder = " ORDER BY created_at DESC ";
      let limitQuery = " limit " + size + " OFFSET " + offset;
      let whereQuery = `WHERE company_id = ${id} `;
      let mainQuery = "";

      if (deal_size) {
        whereQuery +=
          ' AND  client_experience.deal_size LIKE "%' + deal_size + '%" ';
      }

      if (industry_type) {
        whereQuery +=
          ' AND  client_experience.industry_type LIKE "%' +
          industry_type +
          '%" ';
      }

      if (experience_role) {
        whereQuery +=
          ' AND  client_experience.experience_role LIKE "%' +
          experience_role +
          '%" ';
      }
      if (orderBy && order) {
        rderBy == "client_name"
          ? (orderQuery =
            "ORDER BY client_experience." + orderBy + " " + order)
          : "";
        orderBy == "industry_type"
          ? (orderQuery =
            "ORDER BY client_experience." + orderBy + " " + order)
          : "";
        orderBy == "experience_role"
          ? (orderQuery =
            "ORDER BY client_experience." + orderBy + " " + order)
          : "";
        orderBy == "deal_size"
          ? (orderQuery =
            "ORDER BY client_experience." + orderBy + " " + order)
          : "";
      }

      mainQuery = orderQuery
        ? "SELECT * FROM client_experience " +
        whereQuery +
        orderQuery +
        limitQuery
        : "SELECT * FROM client_experience " +
        whereQuery +
        defaultOrder +
        limitQuery;

      const result = await db.query(mainQuery);
      const totalData = await db.query(
        `SELECT * FROM client_experience WHERE company_id = ${id}`
      );

      const totalItems = result.length;
      const totalPages = Math.ceil(totalData.length / size);
      const currentPage = Number(page);
      console.log(mainQuery);
      console.log(result)
      return { result, totalItems, totalPages, currentPage };
    }

  } catch (error) {
    console.log(error)
    return error;
  }
};

const getAllInsights = async (data) => {
  try {
    let offset = (data.page - 1) * data.size;
    let defaultOrder = " ORDER BY news_date DESC ";
    let limitQuery = " limit " + data.size ?? 4 + " OFFSET " + offset;
    let mainQuery =
      " SELECT `news_url`, `news_title`, `news_date`, `company_1_name`, `company_1_logo`, `company_1_description`, `company_1_contact_1_combined`, `company_1_contact_1_email` FROM insights WHERE 1 ";
    const result = await db.query(mainQuery + defaultOrder + limitQuery);

    return result;
  } catch (error) {
    return error;
  }
};
module.exports = {
  getCompaniesList,
  getFirmsList,
  getTotalCount,
  getServiceLines,
  addContact,
  getCompanyById,
  getAllInsights,
};
