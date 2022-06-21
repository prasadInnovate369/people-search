const { response } = require("express");
const express = require("express");
const router = express.Router();
const db = require("../config/migration_db");

const main_db = require("../config/query");

//to migrate companies(servies firms) from lawyer table.

router.get("/companies", async (req, res) => {
  try {
    const companies = await db.queryMigration(
      "SELECT COUNT(law.idlawyer) as totalCount, law._Firm,law._FirmStreet,law._FirmCity,law._FirmState,law._FirmZip,law._FirmAddress,law._Firm_Type,law._Deal_Size,law._companyLogo,law._yearinBusiness,law._about,law._websiteURL,law._industry FROM lawyers law GROUP BY law._Firm"
    );

    companies.map(async (lawyer, index) => {
      const companyData = await main_db.query(
        "SELECT * FROM `companies` WHERE name = ?",
        [lawyer._Firm]
      );
      if (companyData.length === 0) {
        const companyDataAdd = await main_db.query(
          "INSERT INTO `companies` (`name`, `type`, `deal_size`,`street`, `city`, `state`, `zip`, `address`, `no_of_employees`,`company_logo`,`year_in_business`,`about`,`website_url`,`industry`)" +
            "VALUES (?, ?, ?,?, ?,?,?,?,?,?,?,?,?,?)",
          [
            lawyer._Firm,
            lawyer._Firm_Type,
            lawyer._Deal_Size,
            lawyer._FirmStreet,
            lawyer._FirmCity,
            lawyer._FirmState,
            lawyer._FirmZip,
            lawyer._FirmAddress,
            lawyer.totalCount,
            lawyer._companyLogo,
            lawyer._yearinBusiness,
            lawyer._about,
            lawyer._websiteURL,
            lawyer._industry,
          ]
        );
      }
    });
    res.send("companies migrated successfully!");
  } catch (e) {
    console.log(e);
    // return e;
  }
});

router.get("/people", (req, res) => {
  const page = req.query.page * 20;
  const paginateArr = [page];
  const peoplePromise = paginateArr.map(async (pageOffSet) => {
    return await addPeople(pageOffSet);
  });

  Promise.all(peoplePromise)
    .then((values) => {
      console.log(values);
      res.send("Migration completed!");
    })
    .catch((error) => {
      console.error(error.message);
    });
});

const addPeople = (offSet) => {
  new Promise(async (resolve, reject) => {
    console.log("Add people function -> ", offSet);

    try {
      const people = await db.queryMigration(
        "SELECT _firstName,_middleName,_lastName,_title,_bioDetailImage,_email,_telephone,_fileName,_url,_Firm FROM `lawyers` LIMIT 40 offset " +
          offSet
      );

      const peopleAdded = people.map(async (people, index) => {
        let company_id = null;
        let peopleDataAdd = [];
        console.log(" people data object ");
        console.log(people);
        const peopleData = await main_db.query(
          "SELECT * FROM `people` WHERE first_name = ? and last_name = ? and middle_name = ?",
          [people._firstName, people._lastName, people._middleName]
        );

        const peopleFirmData = await main_db.query(
          "SELECT * FROM `companies` WHERE name = ?",
          [people._Firm]
        );
        // console.log(peopleFirmData);
        if (peopleFirmData.length == 0) {
          // const companyDataAdd = main_db.query(
          //   "INSERT INTO `companies` (`name`, `type`, `deal_size`,`street`, `city`, `state`, `zip`, `address`, `no_of_employees`)" +
          //   "VALUES (?, ?, ?,?, ?,?,?,?,?)",
          //   [
          //     people._Firm,
          //     people._Firm_Type,
          //     people._Deal_Size,
          //     people._FirmStreet,
          //     people._FirmCity,
          //     people._FirmState,
          //     people._FirmZip,
          //     people._FirmAddress,
          //     people.totalCount,
          //   ]
          // );
          // company_id = companyDataAdd.id;
        } else {
          company_id = peopleFirmData[0].id;
        }

        console.log(" people company data ");
        console.log(company_id);

        if (peopleData.length === 0) {
          return await main_db.query(
            "INSERT INTO `people` (`first_name`, `middle_name`, `last_name`,`title`, `email`, `telephone_number`, `file_name`, `url`,`company_id`)" +
              "VALUES ( ?, ?,?, ?,?,?,?,?,?)",
            [
              people._firstName,
              people._middleName,
              people._lastName,
              people._title,
              people._email,
              people._telephone,
              people._fileName,
              people._url,
              company_id,
            ]
          );
        } else {
          return [];
        }
      });
      setTimeout(() => {
        resolve(peopleAdded);
      }, 4000);
    } catch (e) {
      console.log(e);
      reject(e);
      // return e;
    }
  });
};

router.get("/publications", async (req, res) => {
  const page = req.query.page * 40;
  try {
    const publications = await db.queryMigration(
      "SELECT law.idlawyer,law._firstName,law._middleName,law._lastName,law._title,law._email,law._telephone,law._fileName,law._url,law._Firm,publ._publicationAreaTitle,publ._publicationAreaDate,publ._publicationAreaURL FROM `lawyers` as law INNER JOIN `publications` as publ LIMIT 40 offset " +
        page
    );

    publications.map(async (publication, index) => {
      let peopleIdLocal = null;
      const publicationData = await main_db.query(
        "SELECT * FROM `publications` WHERE url = ?",
        [publication._publicationAreaURL]
      );

      const peopleDataCheck = await main_db.query(
        "SELECT * FROM `people` WHERE first_name = ? and last_name = ? and middle_name = ?",
        [publication._firstName, publication._lastName, publication._middleName]
      );

      if (peopleDataCheck.length == 0) {
        async (resolve, reject) => {
          try {
            const companyId = await main_db.query(
              "SELECT id FROM `companies` WHERE name = ?",
              [publication._Firm]
            );

            const peopleDataAdd = await main_db.query(
              "INSERT INTO `people` (`first_name`, `middle_name`, `last_name`,`title`, `email`, `telephone_number`, `file_name`, `url`,`company_id`)" +
                "VALUES ( ?, ?,?, ?,?,?,?,?,?)",
              [
                publication._firstName,
                publication._middleName,
                publication._lastName,
                publication._title,
                publication._email,
                publication._telephone,
                publication._fileName,
                publication._url,
                companyId[0].id,
              ]
            );

            const peopleId = await main_db.query(
              "SELECT id FROM `people` WHERE first_name = ? and middle_name = ? and last_name = ? and email = ?",
              [
                publication._firstName,
                publication._middleName,
                publication._lastName,
                publication._email,
              ]
            );

            peopleIdLocal = peopleId[0].id;

            setTimeout(() => {
              console.log("done");
            }, 1000);
            resolve("done");
          } catch (e) {
            console.log(e);
            reject(e);
            // return e;
          }
        };
      } else {
        const peopleId = await main_db.query(
          "SELECT id FROM `people` WHERE first_name = ? and middle_name = ? and last_name = ? and email = ?",
          [
            publication._firstName,
            publication._middleName,
            publication._lastName,
            publication._email,
          ]
        );

        peopleIdLocal = peopleId[0].id;
      }

      if (publicationData.length === 0) {
        const publicationDataAdd = await main_db.query(
          "INSERT INTO `publications` (`title`,`date`,`url`,`people_id`)" +
            "VALUES (?, ?, ?,?)",
          [
            publication._publicationAreaTitle,
            publication._publicationAreaDate,
            publication._publicationAreaURL,
            peopleIdLocal,
          ]
        );
      }
    });
    res.send("all working good.");
  } catch (e) {
    console.log(e);
  }
});

router.get("/service-offers", async (req, res) => {
  const page = req.query.page * 20;
  try {
    const serviceOffers = await db.queryMigration(
      "SELECT practices._practiceAreaTitle,lawyers._email,lawyers._Firm,lawyers._Firm_Type,lawyers._Deal_Size FROM `practices` INNER JOIN lawyers ON practices.idlawyer = lawyers.idlawyer LIMIT 20 OFFSET " +
        page
    );

    serviceOffers.map(async (service, index) => {
      let companyId = await main_db.query(
        "SELECT id FROM `companies` WHERE name = ?",
        [service._Firm]
      );
      let peopleEmail = await main_db.query(
        "SELECT id FROM people WHERE email = ?",
        [service._email]
      );

      console.log(service._practiceAreaTitle, companyId[0].id);

      const serviceExist = await main_db.query(
        "SELECT * FROM `service_lines` WHERE `service_offered`= ? AND `company_id`= ?",
        [service._practiceAreaTitle, companyId[0].id]
      );
      console.log(serviceExist);

      const serviceOfferedById = await main_db.query(
        "INSERT INTO `service_lines` (`service_offered`,`people_id`,`company_id`,`hourly_rates`)" +
          "VALUES (?, ?,?,?) ",
        [service._practiceAreaTitle, peopleEmail[0].id, companyId[0].id, "$100"]
      );
    });
    res.send("all services data fetched.");
  } catch (e) {
    console.log(e);
  }
});

router.get("/client-experience", async (req, res) => {
  try {
    const clientExperience = await db.queryMigration(
      "SELECT l._firstName,l._middleName,l._lastName,l._Firm,e._experience_Rep_Matters_Client,e._experience_Rep_Matters_Combined FROM lawyers l JOIN experiences e ON e.idlawyer = l.idlawyer LIMIT 20 OFFSET 0"
    );

    clientExperience.map(async (experience, index) => {
      let companyId = await main_db.query(
        "SELECT id FROM `companies` WHERE name = ?",
        [experience._Firm]
      );
      console.log(companyId[0].id);
      let peopleId = await main_db.query(
        "SELECT id FROM `people` WHERE first_name = ? AND middle_name = ? AND last_name = ?",
        [experience._firstName, experience._middleName, experience._lastName]
      );
      console.log(peopleId[0].id);

      // const serviceExist = await main_db.query(
      //   "SELECT * FROM `service_lines` WHERE `service_offered`= ? AND `company_id`= ?",
      //   [experience._practiceAreaTitle, peopleId[0].id]
      // );
      // console.log(serviceExist);

      const serviceOfferedById = await main_db.query(
        "INSERT INTO client_experience (client_name, people_id, company_id, experience_role)  VALUES (?,?, ?,?) ",
        [
          experience._experience_Rep_Matters_Client,
          peopleId[0].id,
          companyId[0].id,
          experience._experience_Rep_Matters_Combined,
        ]
      );
    });
    res.send("all experiences data fetched.");
  } catch (e) {
    console.log(e);
  }
});

router.get("/people-education", async (req, res) => {
  try {
    const peopleAllData = await db.queryMigration(
      "SELECT _firstName,_middleName,_lastName,_title,_bioDetailImage,_email,_telephone,_fileName,_url,_Firm,_overview,_educationLawSchool,_educationLawSchool_designation,_educationLawSchool_prestige,_lawSchoolYear,_educationUndergradeSchool,_educationUndergradeSchool_degree,_educationUndergradeSchool_prestige,_undergradeYear,_barAdmissionState_1,_courtAdmission_1 FROM `lawyers` LIMIT 40 offset 0 "
    );

    peopleAllData.map(async (people, index) => {
      let companyId = await main_db.query(
        "SELECT id FROM `companies` WHERE name = ?",
        [people._Firm]
      );
      let company_id = companyId[0].id;
      console.log(company_id);
      const serviceOfferedById = await main_db.query(
        "INSERT INTO people_new (first_name, middle_name, last_name,title, profile_img,email, telephone_number, file_name, url,company_id,_overview,educationLawSchool,educationLawSchool_designation,educationLawSchool_prestige,lawSchoolYear,educationUndergradeSchool,educationUndergradeSchool_degree,educationUndergradeSchool_prestige,undergradeYear,barAdmissionState_1,courtAdmission_1) VALUES( ?, ?,?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ",
        [
          people._firstName,
          people._middleName,
          people._lastName,
          people._title,
          people._bioDetailImage,
          people._email,
          people._telephone,
          people._fileName,
          people._url,
          company_id,
          people._overview,
          people._educationLawSchool,
          people._educationLawSchool_designation,
          people._educationLawSchool_prestige,
          people._lawSchoolYear,
          people._educationUndergradeSchool,
          people._educationUndergradeSchool_degree,
          people._educationUndergradeSchool_prestige,
          people._undergradeYear,
          people._barAdmissionState_1,
          people._courtAdmission_1,
        ]
      );
    });
    res.send("all education data fetched.");
  } catch (e) {
    console.log(e);
  }
});

router.get("/insights", async (req, res) => {
  try {
    const getInsights = await db.queryMigration(
      "SELECT  `newsUrl`, `newsTitle`, `newsDate`, `company_1_Name`, `company_1_Logo`, `company_1_Description`, `company_1_Contact_1_Combined`, `company_1_Contact_1_Email`, `company_1_Contact_1_Phone`, `company_1_Contact_2_Combined`, `company_1_Contact_2_Email`, `company_2_Name`, `company_2_Description`, `company_3_Name`, `company_3_Description` FROM `businesswiremergersacq` WHERE 1 LIMIT 40 offset 0"
    );
    console.log(getInsights);
    getInsights.map(async (insight, index) => {
      const addInsights = await main_db.query(
        "INSERT INTO insights (`news_url`, `news_title`, `news_date`, `company_1_Name`, `company_1_Logo`, `company_1_Description`, `company_1_Contact_1_Combined`, `company_1_Contact_1_Email`, `company_1_Contact_1_Phone`, `company_1_Contact_2_Combined`, `company_1_Contact_2_Email`, `company_2_Name`, `company_2_Description`, `company_3_Name`, `company_3_Description`) VALUES( ?, ?,?, ?,?,?,?,?,?,?,?,?,?,?,?) ",
        [
          insight.newsUrl,
          insight.newsTitle,
          insight.newsDate,
          insight.company_1_Name,
          insight.company_1_Logo,
          insight.company_1_Description,
          insight.company_1_Contact_1_Combined,
          insight.company_1_Contact_1_Email,
          insight.company_1_Contact_1_Phone,
          insight.company_1_Contact_2_Combined,
          insight.company_1_Contact_2_Email,
          insight.company_2_Name,
          insight.company_2_Description,
          insight.company_3_Name,
          insight.company_3_Description,
        ]
      );
    });
    res.send("getInsights fetched successfully.");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
