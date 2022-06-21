const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { sendMail, sendWelcomeEmail } = require("../services/mail.js");

const {
  getUsersList,
  usersLogin,
  usersSignUp,
  getUserByEmail,
  updatePassword,
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
} = require("../models/users");

const getAllSearch = async (req, res) => {
  try {
    const allSearchResult = await getAllSearchResult(req.query);
    res.send({
      msg: "search result.",
      data: allSearchResult,
      statud: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const usersList = await getUsersList();
    res.send({
      msg: "Users fetched successfully!",
      data: usersList.result,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const userLogin = async (req, res) => {
  try {
    const data = {
      email: req.body.email,
      password: req.body.password,
    };
    const usersList = await getUserByEmail(data.email);

    if (usersList) {
      const cmp = await bcrypt.compare(req.body.password, usersList.password);
      delete usersList.password;

      const tokenObj = {
        userId: usersList.id,
        email: usersList.email,
      };

      const token = jwt.sign(tokenObj, process.env.AUTH_TOKEN, {
        expiresIn: "24h",
      });

      if (cmp) {
        res.send({
          status: 200,
          msg: "Logged in successfully!",
          data: usersList,
          token,
        });
      } else {
        res.send({
          status: 400,
          msg: "Login failed! Please try again!",
          data: [],
        });
      }
    } else {
      res.send({
        status: 200,
        msg: "User doesnt exist!",
        data: [],
        token,
      });
    }

  } catch (e) {
    console.log(e)
    res.send({ msg: e.message, status: 400 });
  }
};

const userSignUp = async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      located_profile,
      employed_at,
      password,
      confirm_password,
      phone_number,
    } = req.body;

    if (password !== confirm_password) {
      return res.send({
        msg: "Password & confirm password mismatched!",
        data: [],
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPwd = bcrypt.hashSync(password, salt);
    const splitName = req.body.name.split(" ");

    const data = {
      name,
      firstName: splitName[0],
      lastName: splitName[1],
      email,
      username,
      located_profile,
      employed_at,
      phone_number,
      password: hashedPwd,
    };

    const userExist = await getUserByEmail(email);

    if (userExist) {
      return res.send({
        msg: "User already exist!",
        data: [],
        status: 400,
      });
    }

    const user = await usersSignUp(data);

    const tokenObj = {
      userId: user.insertId,
      email,
    };

    const token = jwt.sign(tokenObj, process.env.AUTH_TOKEN, {
      expiresIn: "24h",
    });
    const updateToken = await updateUserToken(token, user.insertId);
    res.send({
      msg: "User added successfully!",
      data,
      token,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const userForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const data = {
      mailFrom: "neelam.innovate@gmail.com",
      toEmail: email,
      subject: "Quals.com - Reset password",
    };

    const sentEmail = await sendMail(data, email);

    res.send({
      status: "success",
      msg: "Reset link sent to email address!",
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const userResetPassword = async (req, res) => {
  try {
    const { new_password, confirm_password, user } = req.body;

    if (new_password !== confirm_password) {
      res.send({
        msg: "Mismatch new password & confirm password!",
        data: [],
      });
    }
    const saltRounds = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(new_password, saltRounds);

    const data = {
      email: user,
      password: hashedPwd,
    };

    const userData = await updatePassword(data);

    res.send({
      msg: "Password reset successfully!",
      data: userData,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const addDealPosting = async (req, res) => {
  try {
    const {
      hire,
      deal_type,
      deal_industry,
      location,
      fee_mandate,
      deal_size,
      description_mandate,
    } = req.body;
    const userId = req.user.userId;
    const data = {
      hire,
      deal_type,
      deal_industry,
      location,
      fee_mandate,
      deal_size,
      description_mandate,
      userId,
    };

    const newDeal = await newDealPosting(data);

    res.send({
      msg: "Deal Added successfully!",
      data: newDeal,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const getAllDeals = async (req, res) => {
  try {
    const dealList = await getDealList(req.query);
    res.send({
      msg: "Deals Fetched Successfully!",
      data: dealList,
      status: 200,
    });
  } catch (e) {
    res.send({
      msg: e.message,
      status: 400,
    });
  }
};

const addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;
    if (
      email.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)
    ) {
      const addEmail = await addNewSubscriber(email);

      const data = {
        mailFrom: "neelam.innovate@gmail.com",
        toEmail: email,
        subject: "Welcome to Quals.com",
      };

      const sentEmail = await sendWelcomeEmail(data);
      res.send({
        msg: "New Subscriber Added Successfully.",
        status: 200,
      });
    } else {
      res.send({
        msg: "invalid email address.",
      });
    }
  } catch (e) {
    res.send({
      msg: e.message,
      status: 400,
    });
  }
};

const createPeopleProfile = async (req, res) => {
  try {
    const peopleProfile = await createProfile(req.params.id, req.body);
    res.send({
      msg: "profile Updated successfully!",
      data: peopleProfile,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const getProfSerivceFirm = async (req, res) => {
  try {
    const ProfServFirm = await getDropDownData();
    res.send({
      msg: "dropDown Data fetched successfully!",
      data: ProfServFirm,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const getUserById = async (req, res) => {
  try {
    const getUser = await getProfileById(req.params.id);
    res.send({
      msg: "user profile Data fetched successfully!",
      data: getUser,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const addFavourite = async (req, res) => {
  try {
    const { type, typeId } = req.body;
    const userId = req.user.userId;
    const data = { type, typeId, userId };
    const favouriteData = await addFavouriteData(data);
    res.send({
      msg: "favourite added successfully!",
      data: favouriteData,
      status: 200,
    });
  } catch (e) {
    res.send({ msg: e.message, status: 400 });
  }
};

const getMyFavourites = async (req, res) => {
  try {
    const {
      page,
      size,
      detail_type,
      firm,
      firm_type,
      industry,
      location,
      name,
      type,
      orderBy,
      order,
    } = req.query;
    const userId = req.user.userId;
    const data = {
      page,
      size,
      detail_type,
      firm,
      firm_type,
      industry,
      location,
      name,
      type,
      orderBy,
      order,
      userId,
    };
    if (detail_type !== "firm" && detail_type !== "people") {
      res.send({ msg: "Please pass valid type", status: 400 });
    }
    const myFavourite = await getMyFavouriteData(data);
    res.send({
      msg: "Favourite data fetched successfully",
      data: myFavourite,
      status: 200,
    });
  } catch (error) {
    res.send({ msg: error.message, status: 400 });
  }
};

const updateProfilePic = async (req, res) => {
  try {
    const file = req.file;
    const profilePicUploaded = await uploadPic(file, req.params.id);
    res.send({
      msg: "Profile picture uploaded successfully",
      data: profilePicUploaded,
      status: 200,
    });

  } catch (error) {
    res.send.msg = error;
  }
};

const updatePeopleProfile = async (req, res) => {
  try {
    const updateUserPeople = await updateUserPeopleProfile(req);
    // res.send({
    //   msg: "People updated successfully",
    //   data: updateUserPeople,
    //   status: 200,
    // });

  } catch (error) {
    res.send.msg = error;
  }
}

module.exports = {
  getAllUsers,
  userLogin,
  userSignUp,
  userForgotPassword,
  userResetPassword,
  addDealPosting,
  getAllDeals,
  addSubscriber,
  getAllSearch,
  createPeopleProfile,
  getProfSerivceFirm,
  getUserById,
  addFavourite,
  getMyFavourites,
  updateProfilePic,
  updatePeopleProfile
};
