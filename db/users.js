const bcrypt = require('bcrypt');
const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    const SALT_COUNT = 10;
  
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
    
  
    return {
      data: {
        message: "Thanks for signing up!",
        user: {
          id: user.id,
          username: user.username,
        },
      },
      error: null,
      success: true,
    };
  } catch (error) {
    // Check for duplicate username error
    if (error.code === '23505' && error.constraint === 'users_username_key') {
      throw new Error('Username already exists.');
    }
    throw error;
  }
}


/* async function createUser({ username, password }) {
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
    return user; // Return the complete user object with id and username
  } catch (error) {
    // Check for duplicate username error
    if (error.code === '23505' && error.constraint === 'users_username_key') {
      throw new Error('Username already exists.');
    }
    throw error;
  }
} */


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