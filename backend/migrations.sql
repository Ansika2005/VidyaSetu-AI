-- Teacher related tables
CREATE TABLE teacher_classes (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id),
    class_id INTEGER,
    student_id INTEGER REFERENCES users(id),
    assignment_id INTEGER
);

CREATE TABLE class_schedule (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id),
    subject VARCHAR(100),
    class_name VARCHAR(50),
    topic VARCHAR(200),
    date DATE,
    time TIME,
    status VARCHAR(20)
);

-- Student related tables
CREATE TABLE student_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id),
    course_id INTEGER,
    completion_percentage INTEGER,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_activities (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(50),
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parent related tables
CREATE TABLE parent_children (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES users(id),
    child_id INTEGER REFERENCES users(id)
);

CREATE TABLE parent_notifications (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES users(id),
    title VARCHAR(200),
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200),
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 