const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Max number of connections in pool
  idleTimeoutMillis: 30000, // Idle timeout before closing
  connectionTimeoutMillis: 2000, // Timeout for acquiring new client
});

pool.on("connect", async (client) => {
  console.log("✅ Connected to PostgreSQL");
  await client.query("SET application_name = 'realtime-chat-app'");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client", err);
  process.exit(-1);
});

module.exports = pool;
