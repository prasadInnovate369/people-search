const Query = require("mysql/lib/protocol/sequences/Query");
const db = require("../config/query");

const getPeopleList = async (data) => {
  let offset = (data.page - 1) * data.size;
  let orderQuery = "";
  let defaultOrder = " ORDER BY `people`.created_at DESC ";
  let limitQuery = " limit " + data.size + " OFFSET " + offset;
  let whereQuery = ' WHERE `people`.status = "active" ';
  let joinQuery = " JOIN `companies` ON `companies`.id = `people`.company_id ";
  let mainQuery = "";

  if (data.firm) {
    whereQuery += ' AND  `companies`.name LIKE "%' + data.firm + '%" ';
  }

  if (data.type) {
    whereQuery += ' AND  `companies`.type LIKE "%' + data.type + '%" ';
  }

  if (data.title) {
    whereQuery += ' AND  `people`.title LIKE "%' + data.title + '%" ';
  }

  if (data.location) {
    whereQuery += ` AND (companies.state LIKE '%${data.location}%' OR companies.city LIKE '%${data.location}%'
                       OR companies.street LIKE '%${data.location}%') `;
  }

  if (data.name) {
    whereQuery +=
      ' AND  (`people`.first_name LIKE "%' +
      data.name +
      '%" OR `people`.last_name LIKE "%' +
      data.name +
      '%" )';
  }

  if (data.orderBy && data.order) {
    data.orderBy == "first_name"
      ? (orderQuery = "ORDER BY people." + data.orderBy + " " + data.order)
      : "";
    data.orderBy == "type"
      ? (orderQuery = "ORDER BY people.title " + data.order)
      : "";
    data.orderBy == "firm"
      ? (orderQuery = "ORDER BY companies.name " + data.order)
      : "";
    data.orderBy == "location"
      ? (orderQuery = "ORDER BY companies.city " + data.order)
      : "";
  }

  try {
    mainQuery = orderQuery
      ? "SELECT `people`.id AS people_id,people.first_name,people.middle_name,people.last_name,people.title,people.bio,people.profile_img,people.email," +
      "people.telephone_number, people.file_name, people.url, people.status, people.company_id, people.overview, people.law_school," +
      "people.law_school_designation, people.law_school_prestige, people.law_school_year, people.undergrade," +
      "people.undergrade_degree, people.undergrade_prestige, people.undergrade_year," +
      "companies.name, companies.type, companies.deal_size, companies.street, companies.city, companies.state, companies.address FROM `people`" +
      joinQuery +
      whereQuery +
      orderQuery +
      limitQuery
      : "SELECT `people`.id AS people_id,people.first_name,people.middle_name,people.last_name,people.title,people.bio,people.profile_img,people.email," +
      "people.telephone_number, people.file_name, people.url, people.status, people.company_id, people.overview, people.law_school," +
      "people.law_school_designation, people.law_school_prestige, people.law_school_year, people.undergrade," +
      "people.undergrade_degree, people.undergrade_prestige, people.undergrade_year," +
      "companies.name, companies.type, companies.deal_size, companies.street, companies.city, companies.state, companies.address FROM `people`" +
      joinQuery +
      whereQuery +
      defaultOrder +
      limitQuery;

    const result = await db.query(mainQuery);
    const totalData = await db.query(
      "SELECT * FROM `people` WHERE status = 'active'"
    );

    const totalItems = result.length;
    const totalPages = Math.ceil(totalData.length / data.size);
    const currentPage = Number(data.page);

    return { result, totalItems, totalPages, currentPage };
  } catch (e) {
    return e;
  }
};

const getPublicationList = async (data) => {
  try {
    const publicationList = await db.query(
      "SELECT publications.url AS publication_url, publications.title, date, first_name, last_name, middle_name, name FROM `publications`" +
      " JOIN `people` ON `publications`.people_id = `people`.id " +
      'JOIN `companies` ON `companies`.id = `people`.company_id WHERE people.status = "active" ORDER BY `publications`.created_at DESC LIMIT 3 OFFSET 0 '
    );
    return publicationList;
  } catch (e) {
    return e;
  }
};

const getPeopleById = async (query, id) => {
  try {
    if (query.details_type == "overview") {
      const peopleList = await db.query(
        "SELECT CONCAT(`people`.first_name , ' ', `people`.middle_name,' ', `people`.last_name) AS full_name, " +
        " `people`.title,`people`.bio,`people`.profile_img,`people`.email,`people`.telephone_number, `people`.url," +
        " `people`.overview,`people`.law_school,`people`.law_school_designation,`people`.law_school_prestige,`people`.law_school_year, " +
        " `people`.undergrade, `people`.undergrade_degree, `people`.undergrade_prestige, `people`.undergrade_year, `people`.bar_admission, `people`.court_admission ," +
        " `companies`.name AS company_name , `companies`.address " +
        " FROM `people` JOIN `companies` ON `companies`.id = `people`.company_id WHERE `people`.status = 'active' AND `people`.id = ? ",
        [id]
      );
      return peopleList[0];
    }

    if (query.details_type == "publications") {
      const publicationList = await db.query(
        "SELECT * FROM `publications` WHERE `publications`.people_id = ? ORDER BY `publications`.created_at DESC LIMIT 20 ",
        [id]
      );
      return publicationList;
    }
    if (query.details_type == "client_experience") {
      const clientExperience = await db.query(
        "SELECT * FROM client_experience WHERE people_id = ? ORDER BY created_at DESC", [id]
      );
      return clientExperience;
    }
    if (query.details_type == "service_lines") {
      const peoplesServiceLine = await db.query(
        "SELECT service_offered,company_id FROM `service_lines` WHERE people_id = ? ",
        [id]
      );
      const serviceLinesList = await peoplesServiceLine.map(async (service) => {
        const serviceLines = await db.query(
          "SELECT COUNT(id) as no_of_employees,service_offered  FROM `service_lines` WHERE service_offered = ? AND company_id = ? GROUP BY service_offered ",
          [service.service_offered, service.company_id]
        );

        return serviceLines[0];
      });
      const finalResult = Promise.all(serviceLinesList)
        .then((values) => {
          return values;
        })
        .catch((error) => {
          console.error(error.message);
        });

      return finalResult;
    }
  } catch (e) {
    return e;
  }
};

module.exports = {
  getPeopleList,
  getPublicationList,
  getPeopleById,
};
