const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();
require("dotenv").config();

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

router.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        
        // Create context for educational responses
        const prompt = `As an educational AI tutor, help the student with the following question: ${message}. 
                       Provide a clear, concise, and educational response suitable for students.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ 
            message: text,
            type: 'ai'
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ 
            message: "Sorry, I'm having trouble processing your request right now.",
            type: 'error'
        });
    }
});

module.exports = router; 