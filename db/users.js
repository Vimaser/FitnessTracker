const bcrypt = require('bcrypt');
const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  
  try {
    const SALT_COUNT = 10;
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
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
    // Call the getUserByUsername function to retrieve the user object from the database based on the provided username
    const user = await getUserByUsername(username);

    if (!user) {
      return null;
    }

    const hashedPassword = user.password;
    const passwordsMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordsMatch) {
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
