const express = require('express');
const router = express.Router();

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
    destroyRoutine, } = require('../db/routines');

// GET /api/routines
router.get("/", async (req, res, next) => {
    try {
      const routines = await getAllRoutines();
      res.json(routines);
    } catch (error) {
      next(error);
    }
  });
  
  // POST /api/routines
  router.post("/", async (req, res, next) => {
    try {
      const { creatorId, isPublic, name, goal } = req.body;
      const newRoutine = await createRoutine({
        creatorId,
        isPublic,
        name,
        goal,
      });
      res.status(201).json(newRoutine);
    } catch (error) {
      next(error);
    }
  });
  
  // PATCH /api/routines/:routineId
  router.patch("/:routineId", async (req, res, next) => {
    try {
      const { routineId } = req.params;
      const updatedRoutine = await updateRoutine({
        id: routineId,
        ...req.body,
      });
      res.json(updatedRoutine);
    } catch (error) {
      next(error);
    }
  });
  
  // DELETE /api/routines/:routineId
  router.delete("/:routineId", async (req, res, next) => {
    try {
      const { routineId } = req.params;
      const deletedRoutineId = await destroyRoutine(routineId);
      if (deletedRoutineId === null) {
        return res.status(404).json({ error: "Routine not found." });
      }
      res.json({ success: true, deletedRoutineId });
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
