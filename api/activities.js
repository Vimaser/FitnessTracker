const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
} = require("../db/activities");
const { attachActivityToRoutine } = require("../db/activities");
const { getRoutineActivitiesByRoutine } = require("../db/routine_activities");

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
// POST /api/activities
router.post("/", async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    // Check if a token is provided
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({
        error: "No token provided",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || !decodedToken.id) {
      console.log("Invalid token");
      return res.status(401).json({
        error: "Invalid token",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }

    const { name, description } = req.body;
    console.log("Received activity data:", { name, description });

    // Check if an activity with the same name already exists
    const existingActivity = await getActivityByName(name);
    console.log("Existing activity:", existingActivity);

    if (existingActivity) {
      // If the activity already exists, return an error response
      console.log("Activity already exists");
      return res.status(409).json({
        error: "DuplicateActivity",
        message: `An activity with name ${name} already exists`,
        name: "DuplicateActivityError",
      });
    }

    // If the activity does not exist, create a new activity
    const newActivity = await createActivity(name, description);
    console.log("New activity:", newActivity);

    if (!newActivity.success) {
      // If activity creation was unsuccessful, return the error response
      console.log("Activity creation failed");
      return res.status(500).json({
        error: newActivity.error,
        message: newActivity.message,
      });
    }

    console.log("Activity created successfully");
    res.status(201).json(newActivity.data);
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
});




/* 

router.post("/", async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { name, description } = req.body;
    console.log("Token:", token);

    // Check if a token is provided
    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }

    const newActivity = await createActivity({ name, description });
    res.status(201).json(newActivity);
  } catch (error) {
    if (error.name === "DuplicateActivity") {
      return res.status(409).json({
        error: "DuplicateActivity",
        message: `An activity with name ${req.body.name} already exists`,
        name: "DuplicateActivityError",
      });
    }
    next(error);
  }
}); */

// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
  try {
    const token = req.headers.aythorization?.split(" ")

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

    console.log("Received PATCH request for activity with ID:", activityId);
    console.log("User token:", req.headers.authorization);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found." });
    }
    res.json(activity);
  } catch (error) {
    // Handle the ActivityNotFound error
    if (error.message === "Activity not found") {
      return res.status(404).json({ error: "Activity not found." });
    }
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

    if (!updatedActivity) {
      // Handle the case where the activity was not found
      return res.status(404).json({
        success: false,
        error: "ActivityNotFound",
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
    if (error.name === "ActivityNotFound") {
      // Handle the ActivityNotFound error separately
      return res.status(404).json({
        success: false,
        error: "ActivityNotFound",
        message: `Activity ${activityId} not found`,
      });
    } else if (error.name === "DuplicateActivity") {
      // Handle the DuplicateActivity error separately
      return res.status(409).json({
        success: false,
        error: "DuplicateActivity",
        message: `An activity with the name ${req.params.activityId} already exists`,
      });
    }

    // Handle other errors as internal server errors
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An error occurred while updating the activity.",
    });
    next(error);
  }
});

module.exports = router;
