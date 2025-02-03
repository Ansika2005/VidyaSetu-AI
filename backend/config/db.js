const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'vidyasetu',
    port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect()
    .then(client => {
        console.log("Connected to PostgreSQL database");
        // Test query
        return client.query('SELECT NOW()')
            .then(res => {
                console.log('Database connection test successful:', res.rows[0]);
                client.release();
            })
            .catch(err => {
                client.release();
                throw err;
            });
    })
    .catch(err => {
        console.error("Database connection error:", err);
    });

module.exports = pool;
