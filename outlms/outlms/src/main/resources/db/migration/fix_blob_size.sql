-- Migration to fix government_id_image column size
-- This changes BLOB to LONGBLOB to support files up to 10MB

USE outlms_db;

-- Alter the column to LONGBLOB
ALTER TABLE student_registrations 
MODIFY COLUMN government_id_image LONGBLOB;

-- Verify the change
DESCRIBE student_registrations;
