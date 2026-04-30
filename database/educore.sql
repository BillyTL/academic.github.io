-- =====================================================
-- EDUCORE - Sistema de Gestión Académica
-- Base de datos: MySQL (XAMPP)
-- =====================================================

DROP DATABASE IF EXISTS educore_db;
CREATE DATABASE educore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE educore_db;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO roles (name, description) VALUES
('administrador', 'Acceso total al sistema'),
('secretaria',    'Gestiona inscripciones, pagos y datos administrativos'),
('docente',       'Gestiona asistencia y notas de sus cursos'),
('estudiante',    'Consulta sus notas, asistencia y pagos');

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    document_id VARCHAR(30) UNIQUE,
    status ENUM('activo','inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    student_code VARCHAR(20) NOT NULL UNIQUE,
    birth_date DATE,
    address VARCHAR(255),
    guardian_name VARCHAR(150),
    guardian_phone VARCHAR(30),
    status ENUM('activo','inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    teacher_code VARCHAR(20) NOT NULL UNIQUE,
    specialty VARCHAR(150),
    hire_date DATE,
    status ENUM('activo','inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(50),
    period VARCHAR(20) NOT NULL,
    status ENUM('activo','inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    description VARCHAR(255),
    status ENUM('activo','inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('activo','inactivo') DEFAULT 'activo',
    registered_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_enrollment (student_id, course_id),
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_enrollment_user    FOREIGN KEY (registered_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE teacher_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    course_id INT NOT NULL,
    subject_id INT NOT NULL,
    status ENUM('activo','inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_assignment (teacher_id, course_id, subject_id),
    CONSTRAINT fk_assign_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    CONSTRAINT fk_assign_course  FOREIGN KEY (course_id)  REFERENCES courses(id),
    CONSTRAINT fk_assign_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
) ENGINE=InnoDB;

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id  INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('presente','ausente','justificado') NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_attendance (student_id, course_id, subject_id, attendance_date),
    CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_att_course  FOREIGN KEY (course_id)  REFERENCES courses(id),
    CONSTRAINT fk_att_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_att_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
) ENGINE=InnoDB;

CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id  INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    period VARCHAR(20) NOT NULL,
    evaluation_type VARCHAR(50) NOT NULL,
    grade_value DECIMAL(5,2) NOT NULL,
    max_value DECIMAL(5,2) DEFAULT 100.00,
    notes VARCHAR(255),
    status ENUM('activo','inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_grade_range CHECK (grade_value >= 0 AND grade_value <= max_value),
    CONSTRAINT fk_grade_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_grade_course  FOREIGN KEY (course_id)  REFERENCES courses(id),
    CONSTRAINT fk_grade_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_grade_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
) ENGINE=InnoDB;

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('efectivo','tarjeta','qr') NOT NULL,
    reference VARCHAR(100),
    qr_code VARCHAR(100) UNIQUE,
    concept VARCHAR(150) NOT NULL,
    payment_date DATE NOT NULL,
    status ENUM('pendiente','pagado','anulado') DEFAULT 'pagado',
    registered_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_amount CHECK (amount > 0),
    CONSTRAINT fk_pay_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_pay_user    FOREIGN KEY (registered_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_users_status      ON users(status);
CREATE INDEX idx_students_status   ON students(status);
CREATE INDEX idx_teachers_status   ON teachers(status);
CREATE INDEX idx_courses_status    ON courses(status);
CREATE INDEX idx_subjects_status   ON subjects(status);
CREATE INDEX idx_payments_date     ON payments(payment_date);
CREATE INDEX idx_attendance_date   ON attendance(attendance_date);
CREATE INDEX idx_grades_period     ON grades(period);

-- DATOS INICIALES (DEMO)
-- Hash bcrypt del password "password123" generado con saltRounds=10
-- Si en algún caso el hash no funciona, ejecuta UNA vez: POST /api/auth/seed-passwords

INSERT INTO users (role_id, full_name, email, password, phone, document_id) VALUES
(1, 'Administrador General', 'admin@educore.com',     '$2b$10$wNLGqVkW9/NaA73OXLImH.MlFf3LJzSNPxRgZuLp9yBAm9w94dE0e', '70000001', 'DOC-ADM-001'),
(2, 'Lucia Mendez',          'secretaria@educore.com','$2b$10$wNLGqVkW9/NaA73OXLImH.MlFf3LJzSNPxRgZuLp9yBAm9w94dE0e', '70000002', 'DOC-SEC-001'),
(3, 'Carlos Ramirez',        'docente1@educore.com',  '$2b$10$wNLGqVkW9/NaA73OXLImH.MlFf3LJzSNPxRgZuLp9yBAm9w94dE0e', '70000003', 'DOC-DOC-001'),
(3, 'Maria Quispe',          'docente2@educore.com',  '$2b$10$wNLGqVkW9/NaA73OXLImH.MlFf3LJzSNPxRgZuLp9yBAm9w94dE0e', '70000004', 'DOC-DOC-002'),
(4, 'Ana Perez',              'ana@educore.com',      '$2b$10$wNLGqVkW9/NaA73OXLImH.MlFf3LJzSNPxRgZuLp9yBAm9w94dE0e', '71000001', 'EST-001'),
(4, 'Luis Garcia',            'luis@educore.com',     '$2b$10$wNLGqVkW9/NaA73OXLImH.MlFf3LJzSNPxRgZuLp9yBAm9w94dE0e', '71000002', 'EST-002'),
(4, 'Camila Torres',          'camila@educore.com',   '$2b$10$wNLGqVkW9/NaA73OXLImH.MlFf3LJzSNPxRgZuLp9yBAm9w94dE0e', '71000003', 'EST-003'),
(4, 'Diego Flores',           'diego@educore.com',    '$2b$10$wNLGqVkW9/NaA73OXLImH.MlFf3LJzSNPxRgZuLp9yBAm9w94dE0e', '71000004', 'EST-004');

INSERT INTO teachers (user_id, teacher_code, specialty, hire_date) VALUES
(3, 'T-001', 'Matematicas', '2023-02-01'),
(4, 'T-002', 'Lengua y Literatura', '2023-02-15');

INSERT INTO students (user_id, student_code, birth_date, address, guardian_name, guardian_phone) VALUES
(5, 'S-2026-001', '2010-03-15', 'Av. Siempre Viva 123', 'Pedro Perez',   '79000001'),
(6, 'S-2026-002', '2010-07-22', 'Calle Falsa 456',      'Sara Garcia',   '79000002'),
(7, 'S-2026-003', '2009-11-05', 'Av. Bolivar 789',      'Juan Torres',   '79000003'),
(8, 'S-2026-004', '2010-01-30', 'Calle Sucre 321',      'Lina Flores',   '79000004');

INSERT INTO courses (name, level, period) VALUES
('1ro Secundaria A', 'Secundaria', '2026'),
('1ro Secundaria B', 'Secundaria', '2026'),
('2do Secundaria A', 'Secundaria', '2026');

INSERT INTO subjects (name, code, description) VALUES
('Matematicas',          'MAT-101', 'Algebra y aritmetica basica'),
('Lengua y Literatura',  'LEN-101', 'Comprension lectora y redaccion'),
('Ciencias Naturales',   'CN-101',  'Biologia y quimica basica'),
('Historia',             'HIS-101', 'Historia universal y nacional');

INSERT INTO enrollments (student_id, course_id, enrollment_date, registered_by) VALUES
(1, 1, '2026-02-10', 2),
(2, 1, '2026-02-10', 2),
(3, 2, '2026-02-11', 2),
(4, 2, '2026-02-11', 2);

INSERT INTO teacher_assignments (teacher_id, course_id, subject_id) VALUES
(1, 1, 1),
(1, 2, 1),
(2, 1, 2),
(2, 2, 2);

INSERT INTO payments (student_id, amount, payment_method, reference, qr_code, concept, payment_date, registered_by) VALUES
(1, 350.00, 'efectivo', 'REC-0001', NULL,                  'Mensualidad Marzo', '2026-03-05', 2),
(2, 350.00, 'qr',       NULL,       'EDU-QR-1709654321-AB','Mensualidad Marzo', '2026-03-05', 2),
(3, 350.00, 'tarjeta',  'TXN-99887',NULL,                  'Mensualidad Marzo', '2026-03-06', 2);

-- =====================================================
-- TABLA DE HORARIOS
-- =====================================================
CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day_of_week ENUM('Lunes','Martes','Miercoles','Jueves','Viernes','Sabado') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    classroom VARCHAR(50),
    status ENUM('activo','inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_schedule (course_id, day_of_week, start_time),
    CONSTRAINT fk_sch_course FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_sch_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_sch_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
) ENGINE=InnoDB;

INSERT INTO schedules (course_id, subject_id, teacher_id, day_of_week, start_time, end_time, classroom) VALUES
(1, 1, 1, 'Lunes',    '08:00', '09:30', 'Aula 101'),
(1, 1, 1, 'Miercoles','08:00', '09:30', 'Aula 101'),
(1, 2, 2, 'Martes',   '08:00', '09:30', 'Aula 101'),
(1, 2, 2, 'Jueves',   '08:00', '09:30', 'Aula 101'),
(2, 1, 1, 'Lunes',    '10:00', '11:30', 'Aula 202'),
(2, 1, 1, 'Miercoles','10:00', '11:30', 'Aula 202'),
(2, 2, 2, 'Martes',   '10:00', '11:30', 'Aula 202'),
(2, 2, 2, 'Jueves',   '10:00', '11:30', 'Aula 202');
