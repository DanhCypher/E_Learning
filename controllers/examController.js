const Exam = require('../models/exam');

exports.createExam = async (req, res) => {
    let { title } = req.body;
    const userId = req.user.id;

    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    // Nếu title không phải string (ví dụ lỡ truyền ObjectId) thì convert thành chuỗi
    if (typeof title !== "string") {
        title = String(title);
    }

    try {
        const newExam = new Exam({ title: title.trim(), questions: [], createdBy: userId });
        await newExam.save();

        res.status(201).json(newExam);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create exam', error: error.message });
    }
};


exports.getExams = async (req, res) => {
    const userId = req.user.id; // Lấy thông tin tài khoản từ middleware xác thực

    try {
        const exams = await Exam.find({ createdBy: userId }).lean(); // Lọc theo tài khoản
        res.json(exams);
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

exports.createRandomExam = async (req, res) => {
    let { title, numberOfQuestions } = req.body;

    if (!title || !numberOfQuestions) {
        return res.status(400).json({ message: 'Title and number of questions are required' });
    }

    // Đảm bảo title luôn là chuỗi text
    if (typeof title !== "string") {
        title = String(title);
    }

    try {
        const allQuestions = await Exam.aggregate([
            { $unwind: '$questions' },
            { $sample: { size: Number(numberOfQuestions) } } // ép kiểu sang số
        ]);

        if (allQuestions.length < numberOfQuestions) {
            return res.status(400).json({ message: 'Not enough questions available' });
        }

        const newExam = new Exam({
            title: title.trim(),  // ✅ đảm bảo lưu text chứ không phải ObjectId
            questions: allQuestions.map(q => q.questions),
            createdBy: req.user.id
        });

        await newExam.save();

        res.status(201).json({
            message: 'Random exam created successfully',
            examId: newExam.id,
            title: newExam.title // trả về luôn title cho frontend
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create random exam', error: error.message });
    }
};


exports.gradeExam = async (req, res) => {
    const { examId, answers } = req.body;

    if (!examId || !answers) {
        return res.status(400).json({ message: 'Exam ID and answers are required' });
    }

    try {
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        let score = 0;
        exam.questions.forEach((question, index) => {
            if (answers[index] && answers[index] === question.correctAnswer) {
                score++;
            }
        });

        res.status(200).json({ message: 'Exam graded successfully', score, total: exam.questions.length });
    } catch (error) {
        res.status(500).json({ message: 'Failed to grade exam', error: error.message });
    }
};