const pool = require("../../config/postgres");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const login = async (req, res) => {
  const { email, password } = req.body;
  const client = await pool.connect();

  try {
    const existingUser = await client.query(
      `
      SELECT id, name, email, password_hash 
      FROM users 
      WHERE email = $1 
      LIMIT 1
      `,
      [email]
    );

    if (existingUser.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    const user = existingUser.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate short-lived access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // short life
    );

    // Generate long-lived refresh token
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET, // use a different secret!
      { expiresIn: "30d" }
    );

    await client.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [
      refreshToken,
      user.id,
    ]);

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // can't be read by JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    console.error("❌ Login error:", {
      message: error.message,
      stack: error.stack,
      email,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  } finally {
    client.release();
  }
};

const signup = async (req, res) => {
  const { username, email, password } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingUser = await client.query(
      `
      select id from users where email = $1 LIMIT 1`,
      [email]
    );

    if (existingUser.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hashing the password
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // inserting new record
    const userId = uuidv4();
    const insertQuery = `
      INSERT INTO users (id, name, email, password_hash, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, name, email, created_at;
    `;
    const values = [userId, username, email, hashedPassword];
    const result = await client.query(insertQuery, values);

    const user = result.rows[0];

    // commit transaction
    await client.query("COMMIT");

    // Generate short-lived access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // short life
    );

    // Generate long-lived refresh token
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET, // use a different secret!
      { expiresIn: "30d" }
    );

    await client.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [
      refreshToken,
      user.id,
    ]);

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // can't be read by JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // respond to client
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: result.rows[0],
      accessToken,
    });
  } catch (error) {
    // Rollback in case of any error
    await client.query("ROLLBACK");

    console.error("❌ Signup error:", {
      message: error.message,
      stack: error.stack,
      email,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error during signup",
    });
  } finally {
    client.release(); //  release DB connection
  }
};

const logout = async (req, res) => {
  const { userId } = req.body;
  await pool.query(`UPDATE users SET refresh_token = NULL WHERE id = $1`, [
    userId,
  ]);

  res.clearCookie("refreshToken");
  return res.json({ success: true, message: "Logged out successfully" });
};

const refreshToken = async (req, res) => {
  const token =
    req.cookies?.refreshToken ||
    req.body.refreshToken ||
    req.headers["x-refresh-token"];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No refresh token" });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // confirm it matches DB stored token
    const userCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND refresh_token = $2`,
      [decoded.id, token]
    );

    if (userCheck.rowCount === 0) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

module.exports = { login, signup, logout, refreshToken };
