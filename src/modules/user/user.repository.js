const pool = require("../../config/postgres");

exports.getUserById = async (id) => {
  const { rows } = await pool.query(
    "SELECT id, name, email, profile_pic_url, age, created_at FROM users WHERE id = $1",
    [id]
  );
  return rows[0];
};

exports.updateUser = async (userId, { name, profilePicUrl, age }) => {
  const { rows } = await pool.query(
    `
      UPDATE users
      SET name = COALESCE($1, name),
          profile_pic_url = COALESCE($2, profile_pic_url),
          age = COALESCE($3, age),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, email, profile_pic_url, age, updated_at;
    `,
    [name, profilePicUrl, age, userId]
  );
  return rows[0];
};

exports.searchUsers = async (query) => {
  const searchTerm = `%${query.toLowerCase()}%`;
  // console.log("searchTerm -> ", searchTerm);
  const { rows } = await pool.query(
    `
      SELECT id, name, email, profile_pic_url 
      FROM users
      WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $1
      ORDER BY name ASC
      LIMIT 20;
    `,
    [searchTerm]
  );
  return rows;
};
