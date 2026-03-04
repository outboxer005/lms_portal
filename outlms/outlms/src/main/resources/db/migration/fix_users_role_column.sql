-- Fix: Data truncated for column 'role' at row 1
-- The role column must be long enough for values: ADMIN, STUDENT, STAFF (max 7 chars)
-- Run this once if you get "Data truncated for column 'role'" on admin approval.
-- Run in MySQL: source fix_users_role_column.sql  OR  paste in MySQL Workbench.

USE outlms_db;

ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL;
