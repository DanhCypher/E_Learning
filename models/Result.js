const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentName: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
