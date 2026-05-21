-- ==========================================
-- Online Doctor Consultation Platform DDL
-- MySQL 8.0 DDL Schema Definition
-- ==========================================

CREATE DATABASE IF NOT EXISTS `docconsult_db`;
USE `docconsult_db`;

-- Drop tables in topological dependency order
DROP TABLE IF EXISTS `consultation_messages`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `system_feedbacks`;
DROP TABLE IF EXISTS `doctor_profiles`;
DROP TABLE IF EXISTS `users`;

-- 1. Users Table (Core Auth and Role categorization)
CREATE TABLE `users` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NULL, -- Nullable for OAuth2 logins
    `role` ENUM('PATIENT', 'DOCTOR', 'ADMIN') NOT NULL,
    `avatar_url` VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    `provider` VARCHAR(20) DEFAULT 'LOCAL', -- LOCAL or GOOGLE
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Doctor Profiles Table (Specialty details and practiced states)
CREATE TABLE `doctor_profiles` (
    `id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL UNIQUE,
    `specialization` VARCHAR(100) NOT NULL,
    `experience_years` INT NOT NULL DEFAULT 0,
    `consultation_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `rating` DECIMAL(3, 2) DEFAULT 5.00,
    `reviews_count` INT DEFAULT 0,
    `is_verified` BOOLEAN DEFAULT FALSE,
    `diseases_covered` TEXT NOT NULL, -- JSON/Comma-separated symptom tags
    `available_days` VARCHAR(100) NOT NULL, -- e.g., "Monday,Wednesday,Friday"
    `available_slots` VARCHAR(255) NOT NULL, -- e.g., "09:00 AM,10:30 AM,01:30 PM"
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_doctor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_doctor_spec` (`specialization`),
    INDEX `idx_doctor_verified` (`is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Appointments Table (Scheduling and state lifecycle routing)
CREATE TABLE `appointments` (
    `id` VARCHAR(50) NOT NULL,
    `patient_id` VARCHAR(50) NOT NULL,
    `doctor_id` VARCHAR(50) NOT NULL,
    `appointment_date` DATE NOT NULL,
    `time_slot` VARCHAR(20) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_appointment_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_appointment_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor_profiles` (`id`) ON DELETE CASCADE,
    INDEX `idx_appt_date` (`appointment_date`),
    INDEX `idx_appt_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Consultation Messages Table (Real-time and historic STOMP secure chats)
CREATE TABLE `consultation_messages` (
    `id` VARCHAR(50) NOT NULL,
    `appointment_id` VARCHAR(50) NOT NULL,
    `sender_id` VARCHAR(50) NOT NULL,
    `content` TEXT NOT NULL,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_msg_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_msg_appointment` (`appointment_id`),
    INDEX `idx_msg_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. System Feedbacks Table (Admin monitoring metrics/feedbacks)
CREATE TABLE `system_feedbacks` (
    `id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `category` ENUM('COMPLAINT', 'SUGGESTION', 'PRAISE') NOT NULL,
    `message` TEXT NOT NULL,
    `sentiment` ENUM('POSITIVE', 'NEUTRAL', 'NEGATIVE') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_feedback_cat` (`category`),
    INDEX `idx_feedback_sent` (`sentiment`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
