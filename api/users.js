/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {   
    createUser,
    getUser,
    getUserById,
    getUserByUsername } = require('../db/users');

    function generateToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
        };
        const JWT_SECRET = process.env.JWT_SECRET; // Your JWT secret key
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    }

// POST /api/users/register

  
/* router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password Too Short!",
        message: 'Password must be at least 8 characters long.',
      });
    }

    const newUser = await createUser({
      username,
      password,
    });

    res.json({
      success: true,
      error: null,
      data: {
        message: 'Thanks for signing up!',
        user: {
          id: newUser.id,
          username: newUser.username,
        },
      },
      message: 'Any message you want to include here',
      token: 'Any token you want to include here',
    });
  } catch (error) {
    // Handle specific errors
    if (error.message === 'Username already exists.') {
      return res.status(409).json({
        success: false,
        error: 'UserExists',
        message: 'Username already exists.',
      });
    }

    
    if (error.message === 'Password Too Short!') {
      return res.status(400).json({
        success: false,
        error: 'PasswordTooShortError',
        message: 'Password must be at least 8 characters long.',
      });
    }

    next(error);
  }
}); */

  
router.post('/register', async (req, res, next) => {
    
    
    try {
        const { username, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser({
            username, 
            password: hashPassword,
        });
        res.json({
            success: true,
            error: null,
            data: {
                token: generateToken(newUser),
                message: "Thanks for signing up!",
            }, 
        });
        
    } catch ({ name, message }) {
        next({ name, message });
    }
});

// POST /api/users/login

router.post("/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;
  
      const user = await getUser({ username, password });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Authentication failed",
          message: "Invalid credentials",
        });
      }
  
      const token = generateToken(user);
  
      res.json({
        success: true,
        error: null,
        data: {
          token,
          message: "Login successful!",
        },
      });
    } catch (error) {
      next({ message: error.message });
    }
  });
// GET /api/users/me

router.get("/me", async (req, res, next) => {
    try {
      const { user } = req;
      // Assuming you have a middleware to attach the user object to req
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "You must be logged in to access this route.",
        });
      }
  
      
      delete user.password;
  
      res.json({
        success: true,
        error: null,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  });
  
// GET /api/users/:username/routines

router.get("/:username/routines", async (req, res, next) => {
    try {
      const { username } = req.params;
  
      
      const publicRoutines = await getPublicRoutinesByUsername(username);
  
      res.json({
        success: true,
        error: null,
        data: publicRoutines,
      });
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
