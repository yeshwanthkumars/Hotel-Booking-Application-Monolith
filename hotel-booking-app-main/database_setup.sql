-- ============================================================================
-- Hotel Booking System - MySQL Setup Script
-- Run this script in MySQL Command Line or MySQL Workbench
-- ============================================================================

-- Step 1: Drop database if exists (optional, only for fresh setup)
-- DROP DATABASE IF EXISTS hotel_booking_db;

-- Step 2: Create Database
CREATE DATABASE IF NOT EXISTS hotel_booking_db;

-- Step 3: Use the database
USE hotel_booking_db;

-- Step 4: Verify tables will be created by Hibernate (DDL mode: update)
-- Tables that will be auto-created:
-- - hotels (
--     id BIGINT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(255) NOT NULL,
--     location VARCHAR(255) NOT NULL
-- )
--
-- - rooms (
--     id BIGINT PRIMARY KEY AUTO_INCREMENT,
--     room_number VARCHAR(255) NOT NULL,
--     price DECIMAL(10, 2) NOT NULL,
--     hotel_id BIGINT NOT NULL,
--     FOREIGN KEY (hotel_id) REFERENCES hotels(id)
-- )
--
-- - bookings (
--     id BIGINT PRIMARY KEY AUTO_INCREMENT,
--     guest_name VARCHAR(255) NOT NULL,
--     check_in_date DATE NOT NULL,
--     check_out_date DATE NOT NULL,
--     room_id BIGINT NOT NULL,
--     FOREIGN KEY (room_id) REFERENCES rooms(id)
-- )

-- Step 5: Verify Database Created
SHOW DATABASES;

-- Step 6: Verify you're using the correct database
SELECT DATABASE();

-- Step 7: Display tables (after running the application)
-- SHOW TABLES;

-- ============================================================================
-- Sample Data (Optional - Run after application has created tables)
-- ============================================================================

-- Insert Sample Hotels
-- INSERT INTO hotels (name, location) VALUES
-- ('Taj Hotel', 'Mumbai'),
-- ('The Plaza Hotel', 'New York'),
-- ('Marina Bay Sands', 'Singapore');

-- Insert Sample Rooms
-- INSERT INTO rooms (room_number, price, hotel_id) VALUES
-- ('101', 150.00, 1),
-- ('102', 150.00, 1),
-- ('201', 200.00, 2),
-- ('301', 180.00, 3);

-- Insert Sample Bookings
-- INSERT INTO bookings (guest_name, check_in_date, check_out_date, room_id) VALUES
-- ('John Doe', '2026-05-01', '2026-05-05', 1),
-- ('Jane Smith', '2026-05-02', '2026-05-06', 2),
-- ('Robert Johnson', '2026-05-03', '2026-05-07', 3);

-- ============================================================================
-- Verification Queries (Run after inserting data)
-- ============================================================================

-- Count records in each table
-- SELECT COUNT(*) as hotel_count FROM hotels;
-- SELECT COUNT(*) as room_count FROM rooms;
-- SELECT COUNT(*) as booking_count FROM bookings;

-- View all hotels
-- SELECT * FROM hotels;

-- View all rooms with hotel details
-- SELECT r.id, r.room_number, r.price, h.name as hotel_name
-- FROM rooms r
-- JOIN hotels h ON r.hotel_id = h.id;

-- View all bookings with room and hotel details
-- SELECT b.id, b.guest_name, b.check_in_date, b.check_out_date,
--        r.room_number, h.name as hotel_name
-- FROM bookings b
-- JOIN rooms r ON b.room_id = r.id
-- JOIN hotels h ON r.hotel_id = h.id;

-- ============================================================================
-- Database Info
-- ============================================================================

-- Show database statistics
-- SELECT table_name,
--        round(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
-- FROM information_schema.tables
-- WHERE table_schema = 'hotel_booking_db';

-- ============================================================================
-- Script Complete
-- ============================================================================
-- The database 'hotel_booking_db' is now ready for the application.
--
-- Next Steps:
-- 1. Ensure MySQL credentials in application.properties match your setup
-- 2. Run: mvn spring-boot:run
-- 3. Verify tables are created in MySQL
-- 4. Access Swagger UI at http://localhost:8080/swagger-ui.html
-- ============================================================================

