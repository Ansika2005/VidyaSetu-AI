const pool = require("../config/db");

const createUser = async (name, email, hashedPassword, role) => {
    try {
        const query = `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [name, email, hashedPassword, role];
        console.log('Creating user with values:', values);
        const result = await pool.query(query, values);
        console.log('User created:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

const findUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

const findUserById = async (id) => {
    const query = `SELECT * FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const getUserDashboardData = async (userId, role) => {
    let dashboardData = { role };
    
    switch (role) {
        case 'teacher':
            // Get teacher's classes, students, and schedule
            const teacherStats = await pool.query(
                `SELECT 
                    COUNT(DISTINCT student_id) as total_students,
                    COUNT(DISTINCT class_id) as active_classes,
                    COUNT(DISTINCT assignment_id) as pending_assignments
                 FROM teacher_classes 
                 WHERE teacher_id = $1`,
                [userId]
            );
            dashboardData.statistics = teacherStats.rows[0];
            
            // Get teacher's schedule
            const schedule = await pool.query(
                `SELECT * FROM class_schedule 
                 WHERE teacher_id = $1 
                 AND date = CURRENT_DATE 
                 ORDER BY time`,
                [userId]
            );
            dashboardData.schedule = schedule.rows;
            break;

        case 'student':
            // Get student's courses and progress
            const progress = await pool.query(
                `SELECT 
                    course_id,
                    completion_percentage,
                    last_activity
                 FROM student_progress 
                 WHERE student_id = $1`,
                [userId]
            );
            dashboardData.progress = progress.rows;
            
            // Get recent activities
            const activities = await pool.query(
                `SELECT * FROM student_activities 
                 WHERE student_id = $1 
                 ORDER BY timestamp DESC 
                 LIMIT 5`,
                [userId]
            );
            dashboardData.activities = activities.rows;
            break;

        case 'parent':
            // Get children's information
            const children = await pool.query(
                `SELECT * FROM parent_children pc
                 JOIN users u ON pc.child_id = u.id
                 WHERE pc.parent_id = $1`,
                [userId]
            );
            dashboardData.children = children.rows;
            
            // Get notifications
            const notifications = await pool.query(
                `SELECT * FROM parent_notifications 
                 WHERE parent_id = $1 
                 ORDER BY timestamp DESC 
                 LIMIT 10`,
                [userId]
            );
            dashboardData.notifications = notifications.rows;
            break;
    }
    
    return dashboardData;
};

module.exports = { createUser, findUserByEmail, findUserById, getUserDashboardData };
