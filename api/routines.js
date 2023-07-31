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

// POST /api/routines

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;
