const express = require('express');
const app = express.Router();
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

app.post('/register',
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Register a new user.'
    controller.register);

app.post('/login',
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Login a user.'
    controller.login);

app.get('/me',
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Get current user profile.'
    authenticate, 
    controller.getProfile);

app.put('/update-profile', 
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Update current user profile.'
    authenticate, 
    controller.updateProfile
);
    
module.exports = app;
