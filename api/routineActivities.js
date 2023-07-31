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

// DELETE /api/routine_activities/:routineActivityId

module.exports = router;
