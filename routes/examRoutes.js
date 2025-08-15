const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

router.post('/', examController.createExam);
router.get('/', examController.getExams);
router.get('/:id', examController.getExamById);
router.delete('/:id', examController.deleteExam); // Route xóa exam
router.put('/:id', examController.updateExamTitle); // Route sửa tên exam

module.exports = router;