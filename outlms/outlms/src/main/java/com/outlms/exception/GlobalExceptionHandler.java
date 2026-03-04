package com.outlms.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        String msg = ex.getMessage() != null ? ex.getMessage() : "An error occurred.";
        // Avoid exposing raw SQL or constraint messages to the client
        if (msg.contains("Duplicate entry") || msg.contains("constraint") || msg.contains("UKn") || msg.contains("insert into")) {
            if (msg.contains("@")) {
                msg = "This email is already registered. Please use a different email or contact admin.";
            } else {
                msg = "This information is already registered. Please use different details or contact admin.";
            }
        }
        error.put("message", msg);
        error.put("status", "error");
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage() != null ? ex.getMessage() : "";

        if (message.contains("Duplicate entry")) {
            // MySQL message is like: Duplicate entry 'value' for key '...' - value may be email (contains @)
            if (message.contains("@") || message.contains("email") || message.toLowerCase().contains("student_registrations")) {
                error.put("message", "This email is already registered. Please use a different email or contact admin.");
            } else if (message.contains("phone")) {
                error.put("message", "This phone number is already registered. Please use a different number.");
            } else if (message.contains("username") || message.contains("student_id")) {
                error.put("message", "This ID is already in use. Please use a different ID.");
            } else if (message.toLowerCase().contains("books") || message.toLowerCase().contains("isbn")) {
                error.put("message", "A book with this ISBN already exists. Please use a different ISBN.");
            } else {
                error.put("message", "This information is already registered. Please use different details or contact admin.");
            }
        } else {
            error.put("message", "Database error occurred. Please try again or contact support.");
        }
        error.put("status", "error");
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> errors = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        
        errors.put("message", "Validation failed");
        errors.put("errors", fieldErrors);
        errors.put("status", "error");
        
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Invalid credentials. Please check your username/email and password.");
        error.put("status", "error");
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "An unexpected error occurred. Please try again later.");
        error.put("details", ex.getMessage());
        error.put("status", "error");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
