const bcrypt = require('bcrypt');
const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING id, username
    `,
      [username, hashedPassword]
    );
    const user = rows[0];
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    const { rows } = await client.query(
      `
      SELECT id, username, password
      FROM users
      WHERE username = $1
    `,
      [username]
    );
    const user = rows[0];
    if (!user) {
      return null;
    }
    // Verify the password using bcrypt.compare() only if the user exists
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    // Exclude the password field from the result
    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
try {
  const {
    rows: [user],
  } = await client.query(`
    SELECT id, username, password
    FROM users
    WHERE id=${userId}
  `);
  
  if (!user) {
    return null;
  }
  delete user.password;
  return user;
  } catch (error) { 
    throw error;
}
  
}

async function getUserByUsername(userName) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1;
      `,
      [userName]
    );
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername
}