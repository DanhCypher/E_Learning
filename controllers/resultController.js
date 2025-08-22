const Result = require('../models/Result');

exports.saveResult = async (req, res) => {
    const { examId, studentName, score, total } = req.body;

    if (!examId || !studentName || score === undefined || !total) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const result = new Result({ examId, studentName, score, total });
        await result.save();
        res.status(201).json({ message: 'Result saved successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save result', error: error.message });
    }
};
// Lấy tất cả kết quả (mọi exam)
exports.getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('examId', 'title')  // lấy luôn title từ Exam
      .sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
};


