CREATE SEQUENCE user_id_seq;
CREATE TABLE users (
    id INTEGER PRIMARY KEY DEFAULT nextval('user_id_seq'),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('teacher', 'student', 'parent')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER SEQUENCE user_id_seq OWNED BY users.id;