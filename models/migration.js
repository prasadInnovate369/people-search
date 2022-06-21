const migration_db = require('../config/migration_db')

const migratePeople = async () => {
    try {
        const result = await migration_db.query(
            'SELECT * FROM `lawyers`'
        );
        return result;
    } catch (e) {
        console.log(e);
        return e;
    }
}