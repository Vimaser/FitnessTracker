const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
    createUser,
    getUser,
    getUserById,
    getUserByUsername
} = require('../db/users');
const {
getAllRoutinesByUser,
getPublicRoutinesByUser
} = require('../db/routines');
// POST /api/users/register
router.post("/register", async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const userExists = await getUserByUsername(username);
      if (userExists) {
        return res.status(409).json({
            error: 'Username already exists.',
            message: `User ${username} is already taken.`,
            name: 'UserExistsError'
        });
      }
      if (password.length < 8) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long',
            message: 'Password Too Short!',
            name: 'UserPasswordError'
        });
      }
      const newUser = await createUser({ username, password });
      const token = jwt.sign(
        {
          id: newUser.id,
          username: newUser.username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );
      res.json({
        message: "Thank you for signing up",
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
        },
      });
    } catch ({ name, message }) {
      next({
        name: "UserRegistrationError",
        message: "There was an error registering user",
      });
    }
});
// POST /api/users/login
router.post("/login", async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const user = await getUserByUsername(username);
      if (!user) {
        return next({
          error: "User not found",
          message: "User with the provided username does not exist",
          name: "UserNotFoundError",
        });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return next({
          error: "Invalid credentials",
          message: "Invalid username or password",
          name: "InvalidCredentialsError",
        });
      }
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );
      res.json({
        message: "you're logged in!",
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    } catch ({ name, message }) {
      next({
        name: 'LoginError',
        message: 'There was an error during login'
      });
    }
  });
// GET /api/users/me
router.get("/me", async (req, res, next) => {
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
      const user = await getUserById(userId);
      if (!user) {
        return res.status(401).json({
          error: "User not found",
          message: "You must be logged in to perform this action",
          name: "UnauthorizedError",
        });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
});
// GET /api/users/:username/routines
router.get("/:username/routines", async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "You must be logged in to perform this action" });
      }
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (!decodedToken || !decodedToken.id) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const username = req.params.username;
      const user = await getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (decodedToken.username === username) {
        const allRoutines = await getAllRoutinesByUser({ username });
        return res.json(allRoutines);
      } else {
        const publicRoutines = await getPublicRoutinesByUser({ username });
        return res.json(publicRoutines);
      }
    } catch (error) {
      next(error);
    }
});
module.exports = router;