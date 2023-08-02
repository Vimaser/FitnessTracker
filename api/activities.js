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
      if (error.name === 'DuplicateActivity') {
        return res.status(409).json({
          error: 'DuplicateActivity',
          message: `An activity with name ${req.body.name} already exists`,
          /* message: "An activity with name Push Ups already exists", */
          name: `Any`
        });
      }
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

/* 
  router.patch("/:activityId", async (req, res, next) => {
    try {
      const { activityId } = req.params;
      const { name, description } = req.body;
  
      const updatedActivity = await updateActivity({ id: activityId, name, description });
  
      res.json({
        success: true,
        error: null,
        data: {
          id: updatedActivity.id,
          description: updatedActivity.description,
          name: updatedActivity.name,
          
        },
      });
    } catch (error) {
      if (error.name === 'ActivityNotFound') {
        return res.status(404).json({
          success: false,
          error: 'ActivityNotFound',
          message: `Activity ${req.params.activityId} not found`,
        });
      } else if (error.name === 'DuplicateActivity') {
        return res.status(409).json({
          success: false,
          error: 'DuplicateActivity',
          message: `An activity with the name ${req.body.name} already exists`,
        });
      }
  
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while updating the activity.',
      });
  
      next(error);
    }
  }); */
  
  router.patch("/:activityId", async (req, res, next) => {
    try {
      const { activityId } = req.params;
      const { name, description } = req.body;
  
      const updatedActivity = await updateActivity({ id: activityId, name, description });
  
      if (!updatedActivity) {
        // Handle the case where the activity was not found
        return res.status(404).json({
          success: false,
          error: 'ActivityNotFound',
          message: `Activity ${activityId} not found`,
        });
      }
  
      res.json({
        success: true,
        error: null,
        data: {
          name: updatedActivity.name,
          description: updatedActivity.description,
        },
      });
    } catch (error) {
      if (error.name === 'ActivityNotFound') {
        // Handle the ActivityNotFound error separately
        return res.status(404).json({
          success: false,
          error: 'ActivityNotFound',
          message: `Activity ${activityId} not found`,
        });
      } else if (error.name === 'DuplicateActivity') {
        // Handle the DuplicateActivity error separately
        return res.status(409).json({
          success: false,
          error: 'DuplicateActivity',
          message: `An activity with the name ${req.params.activityId} already exists`,
        });
      }
  
      // Handle other errors as internal server errors
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while updating the activity.',
      });
      next(error);
    }
  });
  
  

module.exports = router;
