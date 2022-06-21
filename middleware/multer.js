const multer = require("multer");
const fileStorageEngine = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

module.exports = upload;
