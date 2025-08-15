const mongoose = require('mongoose');

// Định nghĩa schema cho Exam
const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [
        {
            question: { type: String, required: true },
            options: { type: [String], required: true },
            correctAnswer: { type: String, required: true },
        },
    ],
});

// Thêm virtual để chuyển `_id` thành `id`
examSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Đảm bảo virtuals được bao gồm khi chuyển đổi sang JSON
examSchema.set('toJSON', {
    virtuals: true,
});

// Tạo model từ schema
const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;