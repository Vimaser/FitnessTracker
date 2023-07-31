/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();

const {   
    createUser,
    getUser,
    getUserById,
    getUserByUsername } = require('../db/users');
// POST /api/users/register

apiRouter.post('/api/users/register', async (req, res, next) => {
    const { username, password } = req.body;
    
    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                name: "UserExistsError",
                message: "A user by that name already exists",
            });
        }
        const user = await createUser({
            username,
            password
        });

        
    } catch (error) {
        
    }
})
// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
