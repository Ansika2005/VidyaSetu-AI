const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

router.post('/generate', authMiddleware, upload.single('content'), async (req, res) => {
    try {
        let content = '';

        // Log the request details for debugging
        console.log('Request received:', {
            hasFile: !!req.file,
            fileType: req.file?.mimetype,
            bodyContent: !!req.body.content,
            user: req.user
        });

        // Handle PDF file
        if (req.file) {
            if (req.file.mimetype === 'application/pdf') {
                const data = await pdf(req.file.buffer);
                content = data.text;
                console.log('PDF content extracted:', content.substring(0, 100) + '...');
            } else {
                content = req.file.buffer.toString('utf-8');
                console.log('Text content extracted:', content.substring(0, 100) + '...');
            }
        } else if (req.body.content) {
            content = req.body.content;
        } else {
            return res.status(400).json({ message: 'No content provided' });
        }

        const { quizType, questionCount, difficulty } = req.body;

        // Validate required parameters
        if (!quizType || !questionCount || !difficulty) {
            return res.status(400).json({ 
                message: 'Missing required parameters',
                required: { quizType, questionCount, difficulty }
            });
        }

        // Create prompt for quiz generation
        const prompt = `Generate a ${difficulty} level quiz with ${questionCount} questions of type ${quizType} from the following content. Format the output as a JSON array of question objects with 'question', 'options' (for multiple choice), and 'correctAnswer' fields:\n\n${content}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const quizData = response.text();

        // Parse and validate the generated quiz
        let quiz;
        try {
            quiz = JSON.parse(quizData);
            if (!Array.isArray(quiz)) {
                throw new Error('Generated quiz is not in the expected format');
            }
        } catch (error) {
            console.error('Quiz parsing error:', error);
            console.log('Raw quiz data:', quizData);
            throw new Error('Failed to generate valid quiz format');
        }

        res.json({
            message: 'Quiz generated successfully',
            quiz: quiz
        });

    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({
            message: 'Error generating quiz',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router; 