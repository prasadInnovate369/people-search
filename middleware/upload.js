const multer = require("multer");
const path = require('path');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype == "image/jpeg") {
      cb(null, "./uploads");
    } else if (file.mimetype == "text/csv") {
      cb(null, "./clientCSV");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))

  },
});

const fileStore = multer({ storage: fileStorage });

module.exports = {
  fileStore
};