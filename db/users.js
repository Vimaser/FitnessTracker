const bcrypt = require('bcrypt');
const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows: [user] } = await client.query(
      `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [username, hashedPassword]
    );

    delete user.password;

    return user;
  } catch (error) {
    throw error;
  }
}


async function getUser({ username, password }) {
  try {
   
    const user = await getUserByUsername(username);

    if (!user) {
      return null;
    }

    const hashedPassword = user.password;
    const passwordsMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordsMatch) {
      return null;
    }

   
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