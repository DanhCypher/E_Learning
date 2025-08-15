const API_BASE = 'http://localhost:3000';

// DOM Elements
const createExamForm = document.getElementById('create-exam-form');
const examTitleInput = document.getElementById('exam-title');
const examsList = document.getElementById('exams');
const uploadForm = document.getElementById('upload-form');
const examSelect = document.getElementById('exam-select');
const fileInput = document.getElementById('file-input');

// Fetch and display all exams
async function fetchExams() {
    const response = await fetch(`${API_BASE}/exams`);
    const exams = await response.json();

    // Populate exam list
    examsList.innerHTML = '';
    exams.forEach(exam => {
        const li = document.createElement('li');

        // Hiển thị tên exam
        const titleSpan = document.createElement('span');
        titleSpan.textContent = exam.title;

        // Tạo container cho các biểu tượng
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        // Biểu tượng sửa tên exam
        const editIcon = document.createElement('i');
        editIcon.classList.add('fas', 'fa-edit'); // Sử dụng biểu tượng Font Awesome
        editIcon.title = 'Edit';
        editIcon.addEventListener('click', () => {
            const newTitle = prompt('Enter new title for the exam:', exam.title);
            if (newTitle) {
                updateExamTitle(exam.id, newTitle);
            }
        });

        // Biểu tượng xóa exam
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fas', 'fa-trash', 'delete'); // Sử dụng biểu tượng Font Awesome
        deleteIcon.title = 'Delete';
        deleteIcon.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete the exam "${exam.title}"?`)) {
                deleteExam(exam.id);
            }
        });

        // Thêm các biểu tượng vào container
        actionsDiv.appendChild(editIcon);
        actionsDiv.appendChild(deleteIcon);

        // Thêm các phần tử vào danh sách
        li.appendChild(titleSpan);
        li.appendChild(actionsDiv);
        examsList.appendChild(li);
    });

    // Populate exam dropdown
    examSelect.innerHTML = '<option value="">Select an exam</option>'; // Thêm tùy chọn mặc định
    exams.forEach(exam => {
        const option = document.createElement('option');
        option.value = exam.id;
        option.textContent = exam.title;
        examSelect.appendChild(option);
    });
}

// Create a new exam
createExamForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = examTitleInput.value;

    const response = await fetch(`${API_BASE}/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
    });

    if (response.ok) {
        alert('Exam created successfully!');
        examTitleInput.value = '';
        fetchExams();
    } else {
        alert('Failed to create exam.');
    }
});

// Upload questions to an exam
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const examId = examSelect.value; // Lấy giá trị examId từ dropdown

    // Kiểm tra nếu examId không hợp lệ
    if (!examId) {
        alert('Please select an exam before uploading questions.');
        return;
    }

    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE}/questions/${examId}/import`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            alert('Questions uploaded successfully!');
            fileInput.value = '';
        } else {
            const errorData = await response.json();
            alert(`Failed to upload questions: ${errorData.message}`);
        }
    } catch (error) {
        alert('An error occurred while uploading questions.');
        console.error(error);
    }
});

async function deleteExam(examId) {
    try {
        const response = await fetch(`${API_BASE}/exams/${examId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Exam deleted successfully!');
            fetchExams(); // Cập nhật danh sách exam sau khi xóa
        } else {
            const errorData = await response.json();
            alert(`Failed to delete exam: ${errorData.message}`);
        }
    } catch (error) {
        alert('An error occurred while deleting the exam.');
        console.error(error);
    }
}

async function updateExamTitle(examId, newTitle) {
    try {
        const response = await fetch(`${API_BASE}/exams/${examId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle }),
        });

        if (response.ok) {
            alert('Exam title updated successfully!');
            fetchExams(); // Cập nhật danh sách exam sau khi sửa
        } else {
            const errorData = await response.json();
            alert(`Failed to update exam title: ${errorData.message}`);
        }
    } catch (error) {
        alert('An error occurred while updating the exam title.');
        console.error(error);
    }
}

async function deleteQuestion(questionId) {
    try {
        const response = await fetch(`${API_BASE}/questions/${examId}/questions/${questionId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Question deleted successfully!');
            fetchQuestions(); // Cập nhật danh sách câu hỏi sau khi xóa
        } else {
            const errorData = await response.json();
            alert(`Failed to delete question: ${errorData.message}`);
        }
    } catch (error) {
        alert('An error occurred while deleting the question.');
        console.error(error);
    }
}

async function updateQuestion(questionId, newQuestion, newOptions, newCorrectAnswer) {
    try {
        const response = await fetch(`${API_BASE}/questions/${examId}/questions/${questionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: newQuestion,
                options: newOptions,
                correctAnswer: newCorrectAnswer,
            }),
        });

        if (response.ok) {
            alert('Question updated successfully!');
            fetchQuestions(); // Cập nhật danh sách câu hỏi sau khi sửa
        } else {
            const errorData = await response.json();
            alert(`Failed to update question: ${errorData.message}`);
        }
    } catch (error) {
        alert('An error occurred while updating the question.');
        console.error(error);
    }
}

// Initial fetch
fetchExams();