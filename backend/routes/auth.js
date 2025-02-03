const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail, findUserById, getUserDashboardData } = require("../models/userModel");
const authMiddleware = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();

// **Signup Route**
router.post("/signup", async (req, res) => {
    try {
        console.log('Received signup request:', req.body); // Debug log
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password || !role) {
            console.log('Missing required fields:', { name, email, role }); // Debug log
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            console.log('User already exists:', email); // Debug log
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create New User
        const newUser = await createUser(name, email, hashedPassword, role);
        console.log('New user created:', newUser); // Debug log

        // Remove password from response
        delete newUser.password;

        res.status(201).json({ 
            message: "User created successfully", 
            user: newUser 
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
});

// **Login Route**
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find User
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Verify role
        if (user.role !== role) {
            return res.status(400).json({ message: "Invalid role for this user" });
        }

        // Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate Token
        const token = jwt.sign(
            { userId: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        // Remove password from response
        delete user.password;

        res.json({ 
            message: "Login successful", 
            token,
            user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Error during login" });
    }
});

// Get user data and dashboard information
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const user = await findUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get dashboard data based on user role
        const dashboardData = await getUserDashboardData(user.id, user.role);
        
        // Remove sensitive data
        delete user.password;
        
        res.json({
            ...user,
            ...dashboardData
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

// Update task status
router.patch('/tasks/:taskId', authMiddleware, async (req, res) => {
    try {
        const { taskId } = req.params;
        const { completed } = req.body;
        
        await pool.query(
            `UPDATE tasks 
             SET completed = $1, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 AND user_id = $3`,
            [completed, taskId, req.user.userId]
        );
        
        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error updating task' });
    }
});

module.exports = router;
