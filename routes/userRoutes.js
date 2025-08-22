const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route đăng ký người dùng
router.post('/register', userController.registerUser);

// Route đăng nhập người dùng
router.post('/login', userController.loginUser);

module.exports = router;