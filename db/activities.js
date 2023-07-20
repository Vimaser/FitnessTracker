const client = require('./client');

async function createActivity({ name, description }) {
  // return the new activity
  try {
    // Lowercase the activity name to ensure case-insensitive uniqueness
    const lowercasedName = name.toLowerCase();

    // Check if an activity with the same name already exists
    const { rows: existingActivities } = await client.query(
      `SELECT * FROM activities WHERE LOWER(name) = $1;`,
      [lowercasedName]
    );

    if (existingActivities.length > 0) {
      // Activity with the same name already exists, throw an error or handle it as appropriate
      throw new Error('An activity with the same name already exists.');
    }

    // No activity with the same name found, proceed with insertion
    const { rows: [activity] } = await client.query(
      `INSERT INTO activities (name, description)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [lowercasedName, description]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const lowercasedName = name.toLowerCase();
    const { rows: [ activity ] } = await client.query(
      ` INSERT INTO activities (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING
        RETURNING *;
      `,
        [name, description]
    );
    return activity;
   } catch (error) {
    throw error;
   } 
}

async function getAllActivities() {
  // select and return an array of all activities
}

async function getActivityById(id) {}

async function getActivityByName(name) {}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
