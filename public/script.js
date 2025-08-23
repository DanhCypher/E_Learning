const API_BASE = 'http://localhost:3000';

// DOM Elements
const createExamForm = document.getElementById('create-exam-form');
const examTitleInput = document.getElementById('exam-title');
const examsList = document.getElementById('exams');
const uploadForm = document.getElementById('upload-form');
const examSelect = document.getElementById('exam-select');
const fileInput = document.getElementById('file-input');
const registerForm = document.getElementById('register-form');
const randomExamForm = document.getElementById('random-exam-form');
const randomExamTitleSelect = document.getElementById('random-exam-title');
const randomExamQuestionsInput = document.getElementById('random-exam-questions');
const randomExamQuestionsDescription = document.getElementById('random-exam-description');
const loginForm = document.getElementById('login-form');

// render Exam
function renderExams(exams) {
    const examsList = document.getElementById('exams');
    examsList.innerHTML = ''; // Clear previous exams

    exams.forEach(exam => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${exam.title}</span>`;

        // Create action buttons
        const actions = document.createElement('div');
        actions.classList.add('actions');

        const editBtn = document.createElement('button');
        editBtn.classList.add('action-btn', 'edit-btn');
        editBtn.title = 'Edit';
        editBtn.innerHTML = '<i class="fa fa-pencil-alt"></i>';
        editBtn.onclick = () => {
            const newTitle = prompt('Enter new exam title:', exam.title);
            if (newTitle) {
                console.log('Updating exam:', exam.id || exam._id); // Debug log
                updateExamTitle(exam.id || exam._id, newTitle); // Pass the correct exam ID
            }
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('action-btn', 'delete-btn');
        deleteBtn.title = 'Delete';
        deleteBtn.innerHTML = '<i class="fa fa-trash-alt"></i>';
        deleteBtn.onclick = () => {
            console.log('Deleting exam:', exam.id || exam._id); // Debug log
            deleteExam(exam.id || exam._id); // Pass the correct exam ID
        };

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        li.appendChild(actions);

        examsList.appendChild(li);
    });
}

// Fetch and display all exams
async function fetchExams() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE}/exams`, {
            headers: {
                Authorization: `Bearer ${token}`, // Include token
            },
        });

        if (response.status === 401) {
            alert('Unauthorized access. Please log in.');
            window.location.href = 'login.html'; // Redirect to login page
            return;
        }

        const exams = await response.json();

        // lưu dữ liệu vào localStogage
        localStorage.setItem('exams', JSON.stringify(exams));

        renderExams(exams);

        populateExamDropdowns(exams);

        console.log('Exams fetched:', exams); // Debug response

    } catch (error) {
        console.error('Failed to fetch exams:', error);
        alert('An error occurred while fetching exams.');
    }
}

function populateExamDropdowns(exams) {
    const examSelect = document.getElementById('exam-select');
    const randomExamTitleSelect = document.getElementById('random-exam-title');


    // Clear previous options
    examSelect.innerHTML = '<option value="">Select an exam</option>';
    randomExamTitleSelect.innerHTML = '<option value="">Select an exam</option>';

    // Populate dropdowns with exam titles
    exams.forEach(exam => {
        const option1 = document.createElement('option');
        option1.value = exam.id || exam._id;
        option1.textContent = exam.title;
        examSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = exam.id || exam._id;
        option2.textContent = exam.title;
        randomExamTitleSelect.appendChild(option2);
    });
}



// Create a new exam
createExamForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = examTitleInput.value;

    const response = await fetch(`${API_BASE}/exams`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token
        },
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
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
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
    console.log('Exam ID:', examId);
    try {
        const response = await fetch(`${API_BASE}/exams/${examId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
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
    // Lấy examId từ URL để luôn đúng ngữ cảnh
    const examId = new URLSearchParams(window.location.search).get('examId');
    if (!examId) {
        alert('Exam ID is missing!');
        return;
    }
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

// Register a new user
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            alert('User registered successfully!');
            registerForm.reset();
        } else {
            const errorData = await response.json();
            alert(`Failed to register: ${errorData.message}`);
        }
    } catch (error) {
        alert('An error occurred while registering.');
        console.error(error);
    }
});

// Populate dropdown with exam titles
async function populateRandomExamDropdown() {
    try {
        const response = await fetch(`${API_BASE}/exams`);
        const exams = await response.json();

        randomExamTitleSelect.innerHTML = '<option value="">Select an Exam Title</option>'; // Thêm tùy chọn mặc định
        exams.forEach(exam => {
            const option = document.createElement('option');
            option.value = exam.id; // Sử dụng ID của exam làm giá trị
            option.textContent = exam.title; // Hiển thị tiêu đề của exam
            randomExamTitleSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to fetch exams:', error);
        alert('An error occurred while fetching exam titles.');
    }
}

// Handle random exam creation
randomExamForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    console.log('Create Random Exam button clicked'); // Debug log

    const examId = randomExamTitleSelect.value; // Get selected exam ID
    const numberOfQuestions = parseInt(randomExamQuestionsInput.value);

    if (!examId) {
        alert('Please select an exam title.');
        return;
    }

    if (!numberOfQuestions || numberOfQuestions <= 0) {
        alert('Please enter a valid number of questions.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/exams/random`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token
            },
            body: JSON.stringify({ title: examId, numberOfQuestions }),
        });

        if (response.ok) {
            const data = await response.json();
            alert('Random exam created successfully!');
            window.location.href = `takeExam.html?examId=${data.examId}`; // Redirect to the exam link
        } else {
            const errorData = await response.json();
            alert(`Failed to create random exam: ${errorData.message}`);
        }
    } catch (error) {
        alert('An error occurred while creating the random exam.');
        console.error(error);
    }
});

// Login user
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // Save token in localStorage
            alert('Login successful!');
            window.location.href = 'home.html'; // Redirect to the main page
        } else {
            const errorData = await response.json();
            alert(`Failed to login: ${errorData.message}`);
        }
    } catch (error) {
        alert('ccccc');
        alert('An error occurred while logging in.');
        console.error(error);
    }
});


// Initial fetch
fetchExams();