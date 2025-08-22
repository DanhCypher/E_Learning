const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/', authenticate, examController.createExam); // Tạo đề thi
router.get('/', authenticate, examController.getExams); // Lấy danh sách đề thi
router.get('/:id', examController.getExamById); // Lấy thông tin đề thi
router.delete('/:id', authenticate, examController.deleteExam); // Xóa đề thi
router.put('/:id', authenticate, examController.updateExamTitle); // Sửa tên đề thi
router.post('/random', authenticate, examController.createRandomExam); // Create random exam
router.get('/:id', authenticate, examController.getExamById); // Get exam details
router.post('/grade', examController.gradeExam); // Grade exam

module.exports = router;