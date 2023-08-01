const client = require('./client');

async function createActivity({ name, description }) {
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


async function getAllActivities() {
  // select and return an array of all activities
  try {
    const { rows } = await client.query(`
      SELECT id, name, description 
      FROM activities;
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const { rows: [activity]} = await client.query(
      `
      SELECT *
      FROM activities
      WHERE id=$1;
      `,
      [id]
    );

    if (!activity) {
      throw error
    }
    return activity;
  } catch (error) {
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const { rows } = await client.query(
      `
      SELECT id, name, description
      FROM activities
      WHERE name=$1;
      `,
      [name]
    );
    const activity = rows[0];

    return activity;
  } catch (error) {
    throw error;
  }
}

// used as a helper inside db/routines.js
// Kierrany's solution
async function attachActivitiesToRoutines(routines) {
  try {
    const {rows: activities } = await client.query(`
    SELECT activities.*
    FROM activities
    JOIN routine_activities ON activities.id=routine_activities."activityId"
    WHERE routine_activies."routineId"=${routine.id}
    `);

    const {rows: routine_activies } = await client.query(`
    SELECT activities.*
    FROM activities
    JOIN routine_activities ON activities.id=routine_activities."activityId"
    WHERE routine_activies."routineId"=${routine.id}
    `);

    activities.map(activity => routine_activies.filter(routine_activies => {
      if (activity.id === routine_activies.activityId) {
        activity.count = routine_activity.count
        activity.duration = routine_activity.duration
        activity.routineId = routine_activies.routineId
        activity.routineActivityId = routine_activity.id
      }
    }))

    routine.activities = activities;
    return activities;
  } catch (error) {
    console.error(error);
  }
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity

  try {
    const updateFields = Object.keys(fields)
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(", ");

    const values = Object.values(fields);

    const {rows} = await client.query(
      `
      UPDATE activities
      SET ${updateFields}
      WHERE id=$${values.length + 1}
      RETURNING *;
      `,
      [...values, id]
    );

    const updatedActivity = rows[0];

    return updatedActivity;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity
};
