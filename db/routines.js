const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      ` INSERT INTO routines("creatorId", "isPublic", name, goal)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `,
      [creatorId, isPublic, name, goal]
    );
    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM routines
      WHERE id = $1;
      `,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM routines
      LEFT JOIN routine_activities ON routines.id = routine_activities."routineId"
      WHERE routine_activities.id IS NULL;
    `);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT
        r.id AS "routineId",
        r."creatorId",
        r.name AS "routineName",
        r.goal,
        r."isPublic",
        u.username AS "creatorName",
        ra.id AS "routineActivityId",
        ra.count,
        ra.duration,
        a.id AS "activityId",
        a.name AS "activityName",
        a.description AS "activityDescription"
      FROM routines r
      JOIN users u ON r."creatorId" = u.id
      LEFT JOIN routine_activities ra ON r.id = ra."routineId"
      LEFT JOIN activities a ON ra."activityId" = a.id
    `);
    const routinesMap = new Map();
    routines.forEach((row) => {
      const {
        routineId,
        routineName,
        goal,
        creatorId,
        creatorName,
        routineActivityId,
        count,
        duration,
        activityId,
        activityName,
        activityDescription,
      } = row;

      if (!routinesMap.has(routineId)) {
        routinesMap.set(routineId, {
          id: routineId,
          name: routineName,
          goal: goal,
          creatorId: creatorId,
          isPublic: row.isPublic,
          creatorName: creatorName,
          activities: [],
        });
      }

      if (routineActivityId) {
        routinesMap.get(routineId).activities.push({
          id: activityId,
          name: activityName,
          description: activityDescription,
          routineId: routineId,
          routineActivityId: routineActivityId,
          count: count,
          duration: duration,
        });
      }
    });
    const routinesArray = Array.from(routinesMap.values());
    return routinesArray;
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: publicRoutines } = await client.query(`
      SELECT
        r.id AS "routineId",
        r."creatorId",
        r.name AS "routineName",
        r.goal,
        r."isPublic",
        u.username AS "creatorName",
        ra.id AS "routineActivityId",
        ra.count,
        ra.duration,
        a.id AS "activityId",
        a.name AS "activityName",
        a.description AS "activityDescription"
      FROM routines r
      JOIN users u ON r."creatorId" = u.id
      LEFT JOIN routine_activities ra ON r.id = ra."routineId"
      LEFT JOIN activities a ON ra."activityId" = a.id
      WHERE r."isPublic" = true
    `);
    const publicRoutinesMap = new Map(); // To prevent duplicate routines
    publicRoutines.forEach((row) => {
      const {
        routineId,
        routineName,
        goal,
        creatorId,
        creatorName,
        routineActivityId,
        count,
        duration,
        activityId,
        activityName,
        activityDescription,
        isPublic,
      } = row;
      // If the routine is not yet in the map, add it
      if (!publicRoutinesMap.has(routineId)) {
        publicRoutinesMap.set(routineId, {
          id: routineId,
          name: routineName,
          goal: goal,
          creatorId: creatorId,
          creatorName: creatorName,
          isPublic: isPublic,
          activities: [], // Initialize activities array
        });
      }
      // If routineActivityId is not null, then an activity is associated with this routine
      if (routineActivityId) {
        // Add the activity to the routine's activities array
        publicRoutinesMap.get(routineId).activities.push({
          id: activityId,
          name: activityName,
          description: activityDescription,
          routineId: routineId,
          routineActivityId: routineActivityId,
          count: count,
          duration: duration,
        });
      }
    });
    const publicRoutinesArray = Array.from(publicRoutinesMap.values());
    return publicRoutinesArray;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: userRoutines } = await client.query(
      `
      SELECT
        r.id AS "routineId",
        r."creatorId",
        r.name AS "routineName",
        r.goal,
        r."isPublic",
        u.username AS "creatorName",
        ra.id AS "routineActivityId",
        ra.count,
        ra.duration,
        a.id AS "activityId",
        a.name AS "activityName",
        a.description AS "activityDescription"
      FROM routines r
      JOIN users u ON r."creatorId" = u.id
      LEFT JOIN routine_activities ra ON r.id = ra."routineId"
      LEFT JOIN activities a ON ra."activityId" = a.id
      WHERE u.username = $1
    `,
      [username]
    );
    const userRoutinesMap = new Map(); // To prevent duplicate routines
    userRoutines.forEach((row) => {
      const {
        routineId,
        routineName,
        goal,
        creatorId,
        creatorName,
        routineActivityId,
        count,
        duration,
        activityId,
        activityName,
        activityDescription,
        isPublic,
      } = row;
      // If the routine is not yet in the map, add it
      if (!userRoutinesMap.has(routineId)) {
        userRoutinesMap.set(routineId, {
          id: routineId,
          name: routineName,
          goal: goal,
          creatorId: creatorId,
          creatorName: creatorName,
          isPublic: isPublic,
          activities: [], // Initialize activities array
        });
      }
      // If routineActivityId is not null, then an activity is associated with this routine
      if (routineActivityId) {
        // Add the activity to the routine's activities array
        userRoutinesMap.get(routineId).activities.push({
          id: activityId,
          name: activityName,
          description: activityDescription,
          routineId: routineId,
          routineActivityId: routineActivityId,
          count: count,
          duration: duration,
        });
      }
    });
    const userRoutinesArray = Array.from(userRoutinesMap.values());
    return userRoutinesArray;
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: publicUserRoutines } = await client.query(
      `
      SELECT
        r.id AS "routineId",
        r."creatorId",
        r.name AS "routineName",
        r.goal,
        r."isPublic",
        u.username AS "creatorName",
        ra.id AS "routineActivityId",
        ra.count,
        ra.duration,
        a.id AS "activityId",
        a.name AS "activityName",
        a.description AS "activityDescription"
      FROM routines r
      JOIN users u ON r."creatorId" = u.id
      LEFT JOIN routine_activities ra ON r.id = ra."routineId"
      LEFT JOIN activities a ON ra."activityId" = a.id
      WHERE u.username = $1 AND r."isPublic" = true
    `,
      [username]
    );
    const publicUserRoutinesMap = new Map(); // To prevent duplicate routines
    publicUserRoutines.forEach((row) => {
      const {
        routineId,
        routineName,
        goal,
        creatorId,
        creatorName,
        routineActivityId,
        count,
        duration,
        activityId,
        activityName,
        activityDescription,
        isPublic,
      } = row;
      // If the routine is not yet in the map, add it
      if (!publicUserRoutinesMap.has(routineId)) {
        publicUserRoutinesMap.set(routineId, {
          id: routineId,
          name: routineName,
          goal: goal,
          creatorId: creatorId,
          creatorName: creatorName,
          isPublic: isPublic,
          activities: [], // Initialize activities array
        });
      }
      // If routineActivityId is not null, then an activity is associated with this routine
      if (routineActivityId) {
        // Add the activity to the routine's activities array
        publicUserRoutinesMap.get(routineId).activities.push({
          id: activityId,
          name: activityName,
          description: activityDescription,
          routineId: routineId,
          routineActivityId: routineActivityId,
          count: count,
          duration: duration,
        });
      }
    });
    const publicUserRoutinesArray = Array.from(publicUserRoutinesMap.values());
    return publicUserRoutinesArray;
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: publicActiviesRoutines } = await client.query(
      `
      SELECT
        r.id AS "routineId",
        r."creatorId",
        r.name AS "routineName",
        r.goal,
        r."isPublic",
        u.username AS "creatorName",
        ra.id AS "routineActivityId",
        ra.count,
        ra.duration,
        a.id AS "activityId",
        a.name AS "activityName",
        a.description AS "activityDescription"
      FROM routines r
      JOIN users u ON r."creatorId" = u.id
      LEFT JOIN routine_activities ra ON r.id = ra."routineId"
      LEFT JOIN activities a ON ra."activityId" = a.id
      WHERE a.id = $1 AND r."isPublic" = true
    `,
      [id]
    );
    const publicActiviesRoutinesMap = new Map(); // To prevent duplicate routines
    publicActiviesRoutines.forEach((row) => {
      const {
        routineId,
        routineName,
        goal,
        creatorId,
        creatorName,
        routineActivityId,
        count,
        duration,
        activityId,
        activityName,
        activityDescription,
        isPublic,
      } = row;
      // If the routine is not yet in the map, add it
      if (!publicActiviesRoutinesMap.has(routineId)) {
        publicActiviesRoutinesMap.set(routineId, {
          id: routineId,
          name: routineName,
          goal: goal,
          creatorId: creatorId,
          creatorName: creatorName,
          isPublic: isPublic,
          activities: [], // Initialize activities array
        });
      }
      // If routineActivityId is not null, then an activity is associated with this routine
      if (routineActivityId) {
        // Add the activity to the routine's activities array
        publicActiviesRoutinesMap.get(routineId).activities.push({
          id: activityId,
          name: activityName,
          description: activityDescription,
          routineId: routineId,
          routineActivityId: routineActivityId,
          count: count,
          duration: duration,
        });
      }
    });
    const publicActiviesRoutinesArray = Array.from(
      publicActiviesRoutinesMap.values()
    );
    return publicActiviesRoutinesArray;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    const updateFields = Object.keys(fields)
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(", ");

    const values = Object.values(fields);

    const { rows } = await client.query(
      `
      UPDATE routines
      SET ${updateFields}
      WHERE id=$${values.length + 1}
      RETURNING *;
      `,
      [...values, id]
    );

    const updatedRoutine = rows[0];

    return updatedRoutine;
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    const deletedRoutine = await getRoutineById(id);

    if (!deletedRoutine) {
      return null;
    }

    await client.query(
      `
        DELETE FROM routine_activities
        WHERE "routineId" = $1
        `,
      [id]
    );

    const { rowCount } = await client.query(
      `
        DELETE FROM routines
        WHERE id = $1
        `,
      [id]
    );

    if (rowCount === 0) {
      return null;
    }

    return deletedRoutine; 
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
