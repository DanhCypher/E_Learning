const Exam = require('../models/exam');
const mammoth = require('mammoth');

exports.addQuestion = async (req, res) => {
    const { id } = req.params;
    const { question, options, correctAnswer } = req.body;

    if (!question || !options || !correctAnswer || options.length < 2) {
        return res.status(400).json({ message: 'Invalid question data' });
    }

    try {
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        exam.questions.push({ question, options, correctAnswer });
        await exam.save();
        res.status(201).json({ message: 'Question added successfully', question });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add question', error: error.message });
    }
};

exports.gradeExam = async (req, res) => {
    const { id } = req.params;
    const { answers } = req.body;

    try {
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        let score = 0;
        exam.questions.forEach((q, index) => {
            if (q.correctAnswer === answers[index]) {
                score++;
            }
        });

        res.json({ score, total: exam.questions.length });
    } catch (error) {
        res.status(500).json({ message: 'Failed to grade exam', error: error.message });
    }
};

exports.importQuestions = async (req, res) => {
    const { id } = req.params;

    if (!id || id === 'undefined') {
        return res.status(400).json({ message: 'Invalid exam ID' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        const content = result.value;

        const questions = parseQuestionsFromContent(content);
        questions.forEach((q) => {
            exam.questions.push(q);
        });

        await exam.save();
        res.status(201).json({ message: 'Questions imported successfully', questions });
    } catch (error) {
        res.status(500).json({ message: 'Failed to import questions', error: error.message });
    }
};

exports.getQuestions = async (req, res) => {
    const { id } = req.params;

    if (!id || id === 'null') {
        return res.status(400).json({ message: 'Invalid exam ID' });
    }

    try {
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.status(200).json({ questions: exam.questions });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch questions', error: error.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    const { examId, questionId } = req.params;

    try {
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Xóa câu hỏi dựa trên questionId
        exam.questions = exam.questions.filter(q => q._id.toString() !== questionId);
        await exam.save();

        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete question', error: error.message });
    }
};

exports.updateQuestion = async (req, res) => {
    const { examId, questionId } = req.params;
    const { question, options, correctAnswer } = req.body;

    try {
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Tìm câu hỏi cần sửa
        const questionToUpdate = exam.questions.find(q => q._id.toString() === questionId);
        if (!questionToUpdate) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Cập nhật câu hỏi
        if (question) questionToUpdate.question = question;
        if (options) questionToUpdate.options = options;
        if (correctAnswer) questionToUpdate.correctAnswer = correctAnswer;

        await exam.save();
        res.status(200).json({ message: 'Question updated successfully', question: questionToUpdate });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update question', error: error.message });
    }
};

// Hàm xử lý nội dung file Word để tạo câu hỏi
function parseQuestionsFromContent(content) {
    const lines = content.split('\n');
    const questions = [];
    let currentQuestion = null;

    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('Q:')) {
            // Nếu có câu hỏi trước đó, thêm nó vào danh sách
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            // Bắt đầu một câu hỏi mới
            currentQuestion = { question: line.substring(2).trim(), options: [], correctAnswer: null };
        } else if (line.startsWith('A:')) {
            // Thêm đáp án vào câu hỏi hiện tại
            if (currentQuestion) {
                currentQuestion.options.push(line.substring(2).trim());
            }
        } else if (line.startsWith('Correct:')) {
            // Đặt đáp án đúng cho câu hỏi hiện tại
            if (currentQuestion) {
                currentQuestion.correctAnswer = line.substring(8).trim();
            }
        }
    });

    // Thêm câu hỏi cuối cùng vào danh sách
    if (currentQuestion) {
        questions.push(currentQuestion);
    }

    return questions;
}