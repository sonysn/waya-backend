const dotenv = require('dotenv');;
const {Pool} = require('pg');
dotenv.config();

//For Postgres
PSQL = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: process.env.DATABASE,
  password: '1311',
  port: 5432
});

module.exports = {PSQL}