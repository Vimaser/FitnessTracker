const express = require('express');
const router = express.Router();

const { 
    getAllActivities, 
    getActivityById, 
    getActivityByName, 
    attachActivitiesToRoutines, 
    createActivity,
    updateActivity } = require('../db/activities');

// GET /api/activities
router.get("/", async (req, res, next) => {
    try {
      const activities = await getAllActivities();
      res.json(activities);
    } catch (error) {
      next(error);
    }
  });
  
  // POST /api/activities
  router.post("/", async (req, res, next) => {
    try {
      const { name, description } = req.body;
  
      const newActivity = await createActivity({ name, description });
      res.status(201).json(newActivity);
    } catch (error) {
      next(error);
    }
  });
  
  // GET /api/activities/:activityId/routines
  router.get("/:activityId/routines", async (req, res, next) => {
    try {
      const { activityId } = req.params;
 
      res.json({ message: "Not implemented yet." });
    } catch (error) {
      next(error);
    }
  });
  
  // GET /api/activities/:activityId
  router.get("/:activityId", async (req, res, next) => {
    try {
      const { activityId } = req.params;
      const activity = await getActivityById(activityId);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found." });
      }
      res.json(activity);
    } catch (error) {
      next(error);
    }
  });
  
  // PATCH /api/activities/:activityId
  router.patch("/:activityId", async (req, res, next) => {
    try {
      const { activityId } = req.params;
      const { name, description } = req.body;
  
    
  
      const updatedActivity = await updateActivity({
        id: activityId,
        name,
        description,
      });
  
      res.json(updatedActivity);
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
