const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { generateClassCode } = require('../utils/helpers');

// Create a new class code for teacher
router.post('/create-class', authMiddleware, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const classCode = generateClassCode();

        const result = await pool.query(
            'INSERT INTO teacher_students (teacher_id, class_code) VALUES ($1, $2) RETURNING *',
            [teacherId, classCode]
        );

        res.json({
            message: 'Class code created successfully',
            classCode: classCode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating class code' });
    }
});

// Student joins a teacher's class
router.post('/join-class', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id;
        const { classCode } = req.body;

        const teacherResult = await pool.query(
            'SELECT teacher_id FROM teacher_students WHERE class_code = $1',
            [classCode]
        );

        if (teacherResult.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid class code' });
        }

        const teacherId = teacherResult.rows[0].teacher_id;

        await pool.query(
            'UPDATE teacher_students SET student_id = $1 WHERE class_code = $2',
            [studentId, classCode]
        );

        res.json({ message: 'Successfully joined class' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error joining class' });
    }
});

// Create assignment
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { title, description, quizData, dueDate } = req.body;

        const result = await pool.query(
            `INSERT INTO assignments 
            (teacher_id, title, description, quiz_data, due_date) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [teacherId, title, description, quizData, dueDate]
        );

        // Assign to all students of this teacher
        const students = await pool.query(
            'SELECT student_id FROM teacher_students WHERE teacher_id = $1',
            [teacherId]
        );

        for (const student of students.rows) {
            await pool.query(
                'INSERT INTO student_assignments (assignment_id, student_id) VALUES ($1, $2)',
                [result.rows[0].id, student.student_id]
            );
        }

        res.json({
            message: 'Assignment created successfully',
            assignment: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating assignment' });
    }
});

// Get assignments (for both teachers and students)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let assignments;

        if (userRole === 'teacher') {
            assignments = await pool.query(
                `SELECT * FROM assignments WHERE teacher_id = $1 ORDER BY created_at DESC`,
                [userId]
            );
        } else if (userRole === 'student') {
            assignments = await pool.query(
                `SELECT a.*, sa.status, sa.score, sa.submitted_at 
                FROM assignments a 
                JOIN student_assignments sa ON a.id = sa.assignment_id 
                WHERE sa.student_id = $1 
                ORDER BY a.due_date ASC`,
                [userId]
            );
        }

        res.json(assignments.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching assignments' });
    }
});

// Submit assignment (for students)
router.post('/submit/:id', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id;
        const assignmentId = req.params.id;
        const { submission } = req.body;

        const result = await pool.query(
            `UPDATE student_assignments 
            SET status = 'submitted', submission = $1, submitted_at = CURRENT_TIMESTAMP 
            WHERE assignment_id = $2 AND student_id = $3 
            RETURNING *`,
            [submission, assignmentId, studentId]
        );

        res.json({
            message: 'Assignment submitted successfully',
            submission: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting assignment' });
    }
});

module.exports = router; 