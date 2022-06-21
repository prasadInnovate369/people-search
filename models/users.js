const db = require("../config/query");
const { decodedString } = require("../services/crypto");
const { uploadFile } = require("../services/s3");

const getAllSearchResult = async (data) => {
  const size = data.size ?? 8;
  const page = data.page ?? 1;
  const offset = (page - 1) * size;

  let peopleQuery = "";

  if (data.keyword) {
    whereQueryPeople =
      'SELECT * FROM `people` JOIN `companies` ON `companies`.id = `people`.company_id WHERE `people`.status = "active" AND  `people`.first_name LIKE "' +
      data.keyword +
      '%" ' +
      "ORDER BY `people`.created_at DESC limit " +
      size +
      " OFFSET " +
      offset;

    whereQueryCompanies =
      'SELECT * FROM `companies` WHERE  name LIKE "' +
      data.keyword +
      '%" ' +
      "ORDER BY created_at DESC limit " +
      size +
      " OFFSET " +
      offset;

    whereQueryServiceLine =
      'SELECT * FROM `service_lines`JOIN `companies` ON `companies`.`id`=`service_lines`.`company_id` WHERE service_lines.service_offered LIKE "' +
      data.keyword +
      '%" ' +
      "ORDER BY `service_lines`.created_at DESC limit " +
      size +
      " OFFSET " +
      offset;
  }

  try {
    const peopleResult = await db.query(whereQueryPeople);
    const totalPeopleData = await db.query(
      "SELECT * FROM `people` WHERE status = 'active'"
    );

    const totalPeopleItems = peopleResult.length;
    const totalPeoplePages = Math.ceil(totalPeopleData.length / size);
    const currentPeoplePage = Number(page);

    const peopleResultData = [peopleResult];

    const companiesResult = await db.query(whereQueryCompanies);
    const totalCompaniesData = await db.query(
      "SELECT * FROM `companies` WHERE status = 'active'"
    );

    const totalCompaniesItems = companiesResult.length;
    const totalCompaniesPages = Math.ceil(totalCompaniesData.length / size);
    const currentCompaniesPage = Number(page);

    const companiesResultData = [companiesResult];

    const serviceLinesResult = await db.query(whereQueryServiceLine);

    return { peopleResultData, companiesResultData, serviceLinesResult };
  } catch (e) {
    console.log(e);
    return e;
  }
};

const getUsersList = async () => {
  try {
    const result = await db.query("SELECT * FROM `users`");
    return { result };
  } catch (e) {
    console.log(e);
  }
};

const getUserByEmail = async (email) => {
  try {
    const result = await db.query("SELECT * FROM `users` WHERE email = ?", [
      email,
    ]);
    return result[0];
  } catch (e) {
    console.log(e);
    return e;
  }
};

const usersLogin = async (data) => {
  try {
    const result = await db.query(
      "SELECT * FROM `users` WHERE email = ? AND password = ? LIMIT 1",
      [data.email, data.password]
    );

    return result[0];
  } catch (e) {
    console.log(e);
  }
};

const usersSignUp = async (data, token) => {
  try {
    const result = await db.query(
      "INSERT INTO users  (first_name,last_name, password, email,located_profile, employed_at)" +
      "VALUES (?,?,?, ?, ?, ?)",
      [
        data.firstName,
        data.lastName,
        data.password,
        data.email,
        data.located_profile,
        data.employed_at,
      ]
    );
    return result;
  } catch (e) {
    console.log(e);
    return e;
  }
};

// const usersSignUp = async (data) => {
//   try {
//     const splitName = data.name.split(" ");
//     const result = await db.query(
//       "INSERT INTO `users` (`name`,`first_name`,`last_name`, `password`, `email`,`located_profile`, `employed_at`)" +
//         "VALUES ( ?,  ?, ?, ?, ?,?,?);",
//       [
//         data.name,
//         splitName[0],
//         splitName[1],
//         data.password,
//         data.email,
//         data.located_profile,
//         data.employed_at,
//       ]
//     );
//     return result;
//   } catch (e) {
//     return e;
//   }
// };

const updatePassword = async (data) => {
  const email = decodedString(data.email);
  try {
    const result = await db.query(
      "UPDATE `users` SET password = ? WHERE email = ?",
      [data.password, email]
    );
    return result;
  } catch (e) {
    console.log(e);
    return e;
  }
};

const getUserById = async (id) => {
  try {
    const result = await db.query("SELECT * FROM `users` WHERE id = ?", [id]);
    return result[0];
  } catch (e) {
    return e;
  }
};

const newDealPosting = async (data) => {
  try {
    const result = await db.query(
      "INSERT INTO `deal_postings` (`hire`,`deal_type`,`deal_industry`,`location`,`fee_mandate`,`deal_size`,`description_mandate`,user_id)" +
      "VALUES (?,?,?,?,?,?,?,?)",
      [
        data.hire,
        data.deal_type,
        data.deal_industry,
        data.location,
        data.fee_mandate,
        data.deal_size,
        data.description_mandate,
        data.userId,
      ]
    );
    return result;
  } catch (e) {
    return e;
  }
};

const getDealList = async (data) => {
  let orderQuery = " ORDER BY `deal_postings`.created_at DESC ";
  let whereQuery = "";

  // if (data.type) {
  //   whereQuery += ' AND  `companies`.type LIKE "%' + data.type + '%" ';
  // }

  if (data.dealType) {
    let query = ' `deal_postings`.deal_type LIKE "%' + data.dealType + '%" ';
    !whereQuery
      ? (whereQuery += "WHERE " + query)
      : (whereQuery += "AND " + query);
  }

  if (data.dealIndustry) {
    let query =
      '`deal_postings`.deal_industry LIKE "%' + data.dealIndustry + '%" ';
    !whereQuery
      ? (whereQuery += "WHERE" + query)
      : (whereQuery += "AND " + query);
  }

  if (data.dealSize) {
    let query = '`deal_postings`.deal_size LIKE "%' + data.dealSize + '%" ';
    !whereQuery
      ? (whereQuery += "WHERE" + query)
      : (whereQuery += "AND " + query);
  }

  if (data.feeRange) {
    let query = "`deal_postings`.fee_mandate <= " + data.feeRange;
    !whereQuery
      ? (whereQuery += "WHERE" + query)
      : (whereQuery += "AND " + query);
  }

  if (data.location) {
    let query = '`deal_postings`.location LIKE "%' + data.location + '%" ';
    !whereQuery
      ? (whereQuery += "WHERE" + query)
      : (whereQuery += "AND " + query);
  }

  try {
    const result = await db.query(
      "SELECT * FROM `deal_postings` " + whereQuery + orderQuery
    );

    return result;
  } catch (e) {
    return e;
  }
};

const addNewSubscriber = async (email) => {
  try {
    const result = await db.query(
      "INSERT INTO `subscribers` (`email`)" + "VALUES (?)",
      [email]
    );
    return result;
  } catch (e) {
    return e;
  }
};

const createProfile = async (id, data) => {
  try {
    const result = await db.query(
      `UPDATE users SET first_name = ?, last_name = ?, job_title = ?, profession = ?,service_line = ?,phone_number = ?,email = ?,employed_at = ?,street = ?,city = ?, state = ?,country = ?,bio = ? WHERE id = ?`,
      [
        data.firstName,
        data.lastName,
        data.jobTitle,
        data.profession,
        data.serviceLine,
        data.phno,
        data.email,
        data.employedAt,
        data.street,
        data.city,
        data.state,
        data.country,
        data.bio,
        id,
      ]
    );
    return result;
  } catch (e) {
    return e;
  }
};

const updateUserToken = async (token, id) => {
  try {
    const result = await db.query(`UPDATE users SET token = ? WHERE id = ?`, [
      token,
      id,
    ]);
    return result;
  } catch (error) {
    return error;
  }
};

const getDropDownData = async () => {
  try {
    const firmName = await db.query(`SELECT DISTINCT name,id FROM companies`);
    const professionName = await db.query(
      `SELECT DISTINCT profession_name,id FROM profession`
    );
    const serviceLine = await db.query(
      `SELECT DISTINCT service_offered,id FROM service_lines`
    );
    const result = { firmName, professionName, serviceLine };
    return result;
  } catch (error) {
    return error;
  }
};

const getProfileById = async (id) => {
  try {
    const userProfileData = await db.query("SELECT * FROM users WHERE id=?", [
      id,
    ]);
    return userProfileData;
  } catch (error) {
    return error;
  }
};

const addFavouriteData = async (data) => {
  try {
    const result = await db.query(
      "INSERT INTO `favourites` (type,type_id,user_id) " + "VALUES (?,?,?)",
      [data.type, data.typeId, data.userId]
    );
    return result;
  } catch (error) {
    return error;
  }
};

const getMyFavouriteData = async (data) => {

  const { page, size, userId, firm, firm_type, detail_type,
    industry, location, name, type, orderBy, order } = data;
  try {
    let offset = (page - 1) * size;
    let orderQuery = "";
    let defaultOrder = " ORDER BY fav.created_at DESC ";
    let limitQuery = " limit " + size + " OFFSET " + offset;
    let whereQuery = ` WHERE fav.user_id = ${userId} `;
    let joinQuery = "";
    let mainQuery = "";
    let totalQuery = null;

    if (firm) {
      whereQuery += " AND  comp.name LIKE '%" + firm + "%' ";
    }

    if (firm_type) {
      whereQuery += ' AND  comp.type LIKE "%' + firm_type + '%" ';
    }

    if (industry) {
      whereQuery += ' AND  comp.industry LIKE "%' + industry + '%" ';
    }

    if (location) {
      whereQuery += ' AND  comp.city LIKE "%' + location + '%" ';
    }

    if (name) {
      whereQuery += ' AND  people.first_name LIKE "%' + name + '%" ';
    }

    if (type) {
      whereQuery += ' AND people.title LIKE "%' + type + '%" ';
    }

    if (orderBy && order) {
      orderBy == "firm"
        ? (orderQuery = "ORDER BY comp.name " + order)
        : "";
      orderBy == "firm_type"
        ? (orderQuery = "ORDER BY comp.type " + order)
        : "";
      orderBy == "industry"
        ? (orderQuery = "ORDER BY comp.industry " + order)
        : "";
      orderBy == "deal_size"
        ? (orderQuery = "ORDER BY comp.deal_size " + order)
        : "";
      orderBy == "location"
        ? (orderQuery = "ORDER BY comp.city " + order)
        : "";
      orderBy == "name"
        ? (orderQuery = "ORDER BY people.first_name " + order)
        : "";
      orderBy == "type"
        ? (orderQuery = "ORDER BY people.title " + order)
        : "";
    }

    if (detail_type == "firm") {
      joinQuery = " JOIN companies as comp ON comp.id = fav.type_id ";
      whereQuery += ` AND fav.type = "${detail_type}" `;
      mainQuery = orderQuery
        ? "SELECT comp.name as firm, comp.type as firm_type, comp.industry, comp.deal_size, comp.city as location, comp.company_logo FROM favourites as fav " +
        joinQuery +
        whereQuery +
        orderQuery +
        limitQuery
        : "SELECT comp.name as firm, comp.type as firm_type, comp.industry, comp.deal_size, comp.city as location , comp.company_logo FROM favourites as fav " +
        joinQuery +
        whereQuery +
        defaultOrder +
        limitQuery;

      totalQuery = `SELECT comp.name,comp.type, comp.industry,comp.deal_size,comp.city FROM favourites as fav JOIN companies as comp ON comp.id = fav.type_id WHERE fav.type = "${data.detail_type}" AND fav.user_id = ${data.userId}  `;
    } else {
      joinQuery =
        " FROM ((people JOIN favourites as fav ON fav.type_id=people.id) JOIN companies as comp ON comp.id=people.company_id) ";
      whereQuery += ` AND fav.type = "${detail_type}" `;
      mainQuery = orderQuery
        ? `SELECT CONCAT(people.first_name," ",people.last_name) as full_name,people.title as type,comp.name as firm,comp.type as firm_type,comp.industry,comp.deal_size,comp.city as location , comp.company_logo` +
        joinQuery +
        whereQuery +
        orderQuery +
        limitQuery
        : `SELECT CONCAT(people.first_name," ",people.last_name) as full_name,people.title as type,comp.name as firm,comp.type as firm_type,comp.industry,comp.deal_size,comp.city as location , comp.company_logo` +
        joinQuery +
        whereQuery +
        defaultOrder +
        limitQuery;

      totalQuery = `SELECT CONCAT(people.first_name," ",people.last_name) as full_name,people.title,comp.name,comp.type,comp.industry,comp.deal_size,comp.city FROM ((people JOIN favourites as fav ON fav.type_id=people.id) JOIN companies as comp ON comp.id=people.company_id) WHERE fav.type= "${data.detail_type}" AND fav.user_id = ${data.userId} `;
    }

    const result = await db.query(mainQuery);
    const totalData = await db.query(totalQuery);
    const totalItems = result.length;
    const totalPages = Math.ceil(totalData.length / size);
    const currentPage = Number(page);

    return { result, totalItems, totalPages, currentPage };
  } catch (error) {
    return error;
  }
};

const uploadPic = async (file, id) => {
  try {
    const result = await uploadFile(file);
    const addUserPic = await db.query(
      "UPDATE  users SET profile_pic = ? WHERE id = ? ",
      [result.Location, id]
    );
    return { result, addUserPic };
  } catch (error) {
    console.log(error);
  }
};

const updateUserPeopleProfile = async (req) => {
  try {

    const { type } = req.query;
    if (type === "overview") {
      console.log(req.body);

      // const updateUser = await db.query(
      //   `UPDATE users SET first_name = ?, last_name = ?, job_title = ?, profession = ?,service_line = ?,phone_number = ?,email = ?,employed_at = ?,street = ?,city = ?, state = ?,country = ?,bio = ? WHERE id = ?`,
      //   [
      //     data.firstName,
      //     data.lastName,
      //     data.jobTitle,
      //     data.profession,
      //     data.serviceLine,
      //     data.phno,
      //     data.email,
      //     data.employedAt,
      //     data.street,
      //     data.city,
      //     data.state,
      //     data.country,
      //     data.bio,
      //     id,
      //   ]
      // );

    } else if (type === "client_experience") {

    }

  } catch (error) {

  }
}

module.exports = {
  getUsersList,
  usersLogin,
  usersSignUp,
  getUserByEmail,
  updatePassword,
  getUserById,
  newDealPosting,
  getDealList,
  addNewSubscriber,
  getAllSearchResult,
  createProfile,
  updateUserToken,
  getDropDownData,
  getProfileById,
  addFavouriteData,
  getMyFavouriteData,
  uploadPic,
  updateUserPeopleProfile
};
