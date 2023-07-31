const express = require('express');
const router = express.Router();

const { 
    getAllActivities, 
    getActivityById, 
    getActivityByName, 
    attachActivitiesToRoutines, 
    createActivity,
    updateActivity } = require('../db/activities');

// GET /api/activities/:activityId/routines

// GET /api/activities

// POST /api/activities

// PATCH /api/activities/:activityId

module.exports = router;
