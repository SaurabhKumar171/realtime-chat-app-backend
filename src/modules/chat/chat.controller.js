const pool = require("../../config/postgres");

const queryWithPool = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log("🔄 Client acquired from pool");

    const result = await client.query("SELECT * FROM chats LIMIT 5");
    console.log("✅ Users:", result.rows);
  } catch (error) {
    console.error("❌ Database query error:", error);
  } finally {
    if (client) {
      client.release();
      console.log("↩️ Client released back to pool");
    }
  }
};

module.exports = { queryWithPool };
