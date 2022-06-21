const nodemailer = require("nodemailer");
const fs = require("fs");

const emailConfig = require("../config/email.json");
const { encodedString } = require("./crypto");

const env = process.env;

const transporter = nodemailer.createTransport(emailConfig.config);

const sendMail = async (data, email) => {
  const shaCode = encodedString(email);
  const resetLink = `${env.API_URL}/resetpassword/${shaCode}`;

  try {
    fs.readFile(
      __dirname + "/reset-password-template.html",
      "utf8",
      async (err, templateData) => {
        let emailContent = replaceAll(
          templateData,
          "{{resetpassword}}",
          resetLink
        );
        const mailSent = await transporter.sendMail({
          from: data.mailFrom, // sender address
          to: [data.toEmail], // list of receivers
          subject: data.subject, // Subject line
          html: emailContent,
        });

        return mailSent;
      }
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

const sendWelcomeEmail = async (data) => {
  try {
    fs.readFile(
      __dirname + "/welcome-subscriber-template.html",
      "utf8",
      async (err, templateData) => {
        const mailSent = await transporter.sendMail({
          from: data.mailFrom, // sender address
          to: [data.toEmail], // list of receivers
          subject: data.subject, // Subject line
          html: templateData,
        });

        return mailSent;
      }
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

// const sendRegistrationEmail = (user) => {
//   fs.readFile(
//     __dirname + "/welcome-email-template.html",
//     "utf8",
//     (err, templateData) => {
//       const userEmail = `${user.email}`;
//       let emailContent = replaceAll(templateData, "{{userEmail}}", userEmail);
//       this.sendEmail(user.email, "Registration Complete", emailContent).then();
//     }
//   );
// };

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}

module.exports = {
  sendMail,
  sendWelcomeEmail,
};
