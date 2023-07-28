const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO routine_activities("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [routineId, activityId, count, duration]
    );

    if (rows.length === 0) {
      throw new Error("Failed to add activity to routine.");
    }

    return rows[0];
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
      `
  SELECT *
  FROM routine_activities
  WHERE id=$1
  `,
      [id]
    );
    if (!routineActivity) {
      throw error;
    }
    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows } = await client.query(
      `
    SELECT *
    FROM routine_activities
    WHERE "routineId"=$1;
    `,
      [id]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try {
  const updateFields = Object.keys(fields)
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(", ");

  const values = Object.values(fields);

  const {rows} = await client.query(
    `
    UPDATE routine_activities
    SET ${updateFields}
    WHERE id=$${values.length + 1}
    RETURNING *;
    `,
    [...values, id]
  );

  const updatedRoutinesActivity = rows[0];

  return updatedRoutinesActivity;
} catch (error) {
  throw error;
}}

async function destroyRoutineActivity(id) {
  try {
    const { rows } = await client.query(
      `
      DELETE FROM routine_activities
      WHERE id = $1
      RETURNING *;
    `, [id]);
    
    console.log('rowsCount:', rows);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const {rows: [routineActivity] } = await client.query(
      `
      SELECT ra.*, r."creatorId" AS "routineCreatorId"
      FROM routine_activities ra
      JOIN routines r ON ra."routineId" = r.id
      WHERE ra.id = $1
      `,
      [routineActivityId]
    );

    if (!routineActivity) {
      return false;
    }

    const isCreator = routineActivity.routineCreatorId === userId;

    return isCreator
    
  } catch (error) {
    throw error
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
