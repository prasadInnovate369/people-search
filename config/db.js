const env = process.env;

const config = {
    db: { /* don't expose password or any sensitive info, done only for demo */
        host: env.DB_HOST,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    },
    listPerPage: env.LIST_PER_PAGE || 10,
};

module.exports = config;

// let mysql = require('mysql');

// let con = mysql.createConnection({
//     host: env.DB_HOST,
//     user: env.DB_USER,
//     password: env.DB_PASSWORD,
//     database: env.DB_NAME,
// });

// con.connect(function (err) {
//     if (err) throw err;
//     con.query("SELECT * FROM users", function (err, result) {
//         if (err) throw err;
//         console.log(result);
//     });
// });