const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "X-Album07",
    host: "localhost",
    port: 5432,
    database: "tp"
});


module.exports = pool;