const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

const {
    register,
    login,
    logout,
    logoutAll,
    getMe,
} = require('../controller/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/logoutall', protect, logoutAll);
router.get('/me', protect, getMe);

module.exports = router;