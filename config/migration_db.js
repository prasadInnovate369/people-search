const mysql = require('mysql2/promise');
const env = process.env;

const config = {
    db: { /* don't expose password or any sensitive info, done only for demo */
        host: env.DB_HOST_MIGRATION,
        user: env.DB_USER_MIGRATION,
        password: env.DB_PASSWORD_MIGRATION,
        database: env.DB_NAME_MIGRATION,
    },
    listPerPage: env.LIST_PER_PAGE || 10,
};

async function queryMigration(sql, params) {
    const connection = await mysql.createConnection(config.db);
    const [results,] = await connection.execute(sql, params);

    return results;
}

module.exports = {
    queryMigration
}