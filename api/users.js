/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const {   
    createUser,
    getUser,
    getUserById,
    getUserByUsername } = require('../db/users');
// POST /api/users/register

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

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
