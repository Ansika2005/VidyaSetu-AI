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

        console.log('Request body:', req.body);
        console.log('File:', req.file);

        // Handle PDF file
        if (req.file) {
            if (req.file.mimetype === 'application/pdf') {
                const data = await pdf(req.file.buffer);
                content = data.text;
            } else {
                content = req.file.buffer.toString('utf-8');
            }
        } else if (req.body.content) {
            content = req.body.content;
        } else {
            return res.status(400).json({ message: 'No content provided' });
        }

        const { quizType, questionCount, difficulty } = req.body;

        // Format the prompt to get structured output
        const prompt = `Generate a ${difficulty} level quiz with ${questionCount} questions based on this content: 
                       "${content}"
                       
                       Format each question as a JSON object with these fields:
                       - question (string): The question text
                       - options (array): For multiple choice, 4 possible answers
                       - correctAnswer (string): The correct answer
                       
                       Return an array of these question objects.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean and parse the response
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        let quiz;
        try {
            quiz = JSON.parse(cleanedText);
        } catch (error) {
            console.error('Failed to parse quiz JSON:', cleanedText);
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
            error: error.message
        });
    }
});

module.exports = router; 