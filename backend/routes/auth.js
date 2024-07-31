const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

// POST /api/auth/signup
router.post('/signup', userCtrl.signup);

// POST /api/auth/login
router.post('/login', userCtrl.login);

module.exports = router;
