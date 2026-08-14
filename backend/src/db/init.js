/* ==================================================
   DB INIT
   Runs schema.sql against the configured database.
   Usage: npm run db:init
================================================== */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function init() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    try {
        await pool.query(schema);
        console.log('✅ Database schema created successfully.');
    } catch (err) {
        console.error('❌ Failed to run schema:', err.message);
    } finally {
        await pool.end();
    }
}

init();
