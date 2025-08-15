const Exam = require('../models/exam');

exports.createExam = async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const newExam = new Exam({ title, questions: [] });
        await newExam.save();

        // Chuyển đổi `_id` thành `id`
        const examObject = newExam.toObject();
        examObject.id = examObject._id;
        delete examObject._id;
        delete examObject.__v;

        res.status(201).json(examObject);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create exam', error: error.message });
    }
};

exports.getExams = async (req, res) => {
    try {
        const exams = await Exam.find().lean(); // Sử dụng `.lean()` để chuyển đổi sang đối tượng JavaScript thuần túy
        const formattedExams = exams.map(exam => ({
            id: exam._id,
            title: exam.title,
            questions: exam.questions,
        }));

        res.json(formattedExams);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch exams', error: error.message });
    }
};

exports.getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch exam', error: error.message });
    }
};

// Xóa exam
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete exam', error: error.message });
    }
};

// Sửa tên exam
exports.updateExamTitle = async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            { title },
            { new: true } // Trả về exam đã cập nhật
        );
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update exam title', error: error.message });
    }
};