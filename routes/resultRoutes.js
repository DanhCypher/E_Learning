const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

router.post('/', resultController.saveResult);
router.get('/', resultController.getAllResults); // lấy tất cả điểm
module.exports = router;
