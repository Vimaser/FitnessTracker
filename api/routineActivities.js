const express = require('express');
const router = express.Router();

const { 
    getRoutineActivityById, 
    addActivityToRoutine, 
    getRoutineActivitiesByRoutine, 
    updateRoutineActivity, 
    destroyRoutineActivity, 
    canEditRoutineActivity } = require('../db/routine_activities');

// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", async (req, res, next) => {
    try {
      const { routineActivityId } = req.params;
      const { count, duration } = req.body;
  
     
      const canEdit = await canEditRoutineActivity(routineActivityId, req.user.id);
  
      if (!canEdit) {
        return res.status(403).json({ error: "Unauthorized to edit this routine activity." });
      }
  
      const updatedRoutineActivity = await updateRoutineActivity({
        id: routineActivityId,
        count,
        duration,
      });
      res.json(updatedRoutineActivity);
    } catch (error) {
      next(error);
    }
  });
  
  // DELETE /api/routine_activities/:routineActivityId
  router.delete("/:routineActivityId", async (req, res, next) => {
    try {
      const { routineActivityId } = req.params;
  
     
      const canEdit = await canEditRoutineActivity(routineActivityId, req.user.id);
  
      if (!canEdit) {
        return res.status(403).json({ error: "Unauthorized to delete this routine activity." });
      }
  
      const deletedRoutineActivity = await destroyRoutineActivity(routineActivityId);
      if (!deletedRoutineActivity) {
        return res.status(404).json({ error: "Routine activity not found." });
      }
  
      res.json({ success: true, deletedRoutineActivity });
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
