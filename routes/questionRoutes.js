const express = require('express');
const router = express.Router();
const multer = require('multer');
const questionController = require('../controllers/questionController');

// Cấu hình multer để xử lý upload file
const upload = multer();

router.post('/:id/questions', questionController.addQuestion);
router.post('/:id/grade', questionController.gradeExam);
router.post('/:id/import', upload.single('file'), questionController.importQuestions);
router.get('/:id/questions', questionController.getQuestions); // Route để lấy danh sách câu hỏi
router.delete('/:examId/questions/:questionId', questionController.deleteQuestion);
router.put('/:examId/questions/:questionId', questionController.updateQuestion);

module.exports = router;