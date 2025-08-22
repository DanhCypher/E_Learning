const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');
const resultRoutes = require('./routes/resultRoutes');

// Load environment variables from .env file
dotenv.config();

// Kết nối MongoDB
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

app.use(express.json());
app.use('/exams', examRoutes);
app.use('/questions', questionRoutes);
app.use('/users', userRoutes);
app.use('/results', resultRoutes);

// Serve static files


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));

});

app.use(express.static(path.join(__dirname, 'public'))); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});