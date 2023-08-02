const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
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
  } = require('../db/routines');
const {
  attachActivityToRoutine,
} = require('../db/activities');
const {
  getRoutineActivitiesByRoutine,
} = require('../db/routine_activities');

// GET /api/routines
router.get('/', async (req, res, next) => {
  try {
    const publicRoutines = await getAllPublicRoutines();
    res.json(publicRoutines);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines
router.post('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({
        error: "Invalid token",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }
    const userId = decodedToken.id;
    const { name, goal, isPublic } = req.body;
    const newRoutine = await createRoutine({ creatorId: userId, name, goal, isPublic });
    res.status(201).json(newRoutine);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/routines/:routineId
router.patch('/:routineId', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({
        error: "Invalid token",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }
    const userId = decodedToken.id;
    const routineId = req.params.routineId;
    const { isPublic, name, goal } = req.body;
    const existingRoutine = await getRoutineById(routineId);
    if (!existingRoutine) {
      return res.status(404).json({
        error: "Not Found",
        message: "Routine not found",
        name: "UnauthorizedError",
      });
    }
    if (existingRoutine.creatorId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: `User ${decodedToken.username} is not allowed to update ${existingRoutine.name}`,
        name: "UnauthorizedError",
      });
    }
    const updatedRoutineData = {
      isPublic: isPublic !== undefined ? isPublic : existingRoutine.isPublic,
      name: name || existingRoutine.name,
      goal: goal || existingRoutine.goal,
    };
    const updatedRoutine = await updateRoutine({ id: routineId, ...updatedRoutineData });
    res.json(updatedRoutine);
  } catch (error) {
    next(error);
  }
});

  // DELETE /api/routines/:routineId
router.delete('/:routineId', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({
        error: "Invalid token",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }
    const userId = decodedToken.id;
    const routineId = req.params.routineId;
    const existingRoutine = await getRoutineById(routineId);
    if (!existingRoutine) {
      return res.status(404).json({
        error: "Not Found",
        message: "Routine not found",
        name: "NotFoundError",
      });
    }
    if (existingRoutine.creatorId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: `User ${decodedToken.username} is not allowed to delete ${existingRoutine.name}`,
        name: "UnauthorizedError",
      });
    }
    const deletedRoutine = await destroyRoutine(routineId);
    if (!deletedRoutine) {
      return res.status(404).json({
        error: "Not Found",
        message: "Routine not found",
        name: "NotFoundError",
      });
    }
    res.json(deletedRoutine);
  } catch (error) {
    next(error);
  }
});

// POST /routines/:routineId/activities
router.post('/:routineId/activities', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({
        error: "Invalid token",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }
    const userId = decodedToken.id;
    const routineId = req.params.routineId;
    const { activityId, count, duration } = req.body;
    const existingRoutine = await getRoutineById(routineId);
    if (!existingRoutine) {
      return res.status(404).json({
        error: "Not Found",
        message: "Routine not found",
        name: "NotFoundError",
      });
    }
    if (existingRoutine.creatorId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: `User ${decodedToken.username} is not allowed to attach activity to ${existingRoutine.name}`,
        name: "UnauthorizedError",
      });
    }
    const existingRoutineActivities = await getRoutineActivitiesByRoutine({
      id: routineId,
    });
    const isDuplicateActivity = existingRoutineActivities.some(
      (routineActivity) => routineActivity.activityId === activityId
    );
    if (isDuplicateActivity) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
        name: 'DuplicateRoutineActivityError',
      });
    }
    const attachedActivity = await attachActivityToRoutine(
      routineId,
      activityId,
      count,
      duration
    );
    res.json(attachedActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
