package com.outlms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
public class FileStorageService {
    
    @Value("${file.upload-dir:uploads/documents}")
    private String uploadDir;
    
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png"
    );
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    /**
     * Store uploaded document file
     */
    public String storeFile(MultipartFile file, String registrationId, String idType) throws IOException {
        // Validate file
        validateFile(file);
        
        // Create directory structure: uploads/documents/{registrationId}/
        Path uploadPath = Paths.get(uploadDir, registrationId);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate filename: {idType}_{timestamp}.{extension}
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : ".pdf";
        String filename = idType + "_" + timestamp + extension;
        
        // Store file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return relative path
        return registrationId + "/" + filename;
    }
    
    /**
     * Load file as byte array
     */
    public byte[] loadFile(String filePath) throws IOException {
        Path path = Paths.get(uploadDir, filePath);
        if (!Files.exists(path)) {
            throw new RuntimeException("File not found: " + filePath);
        }
        return Files.readAllBytes(path);
    }
    
    /**
     * Delete file
     */
    public void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(uploadDir, filePath);
        if (Files.exists(path)) {
            Files.delete(path);
        }
    }
    
    /**
     * Validate file type and size
     */
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }
        
        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size must not exceed 5MB");
        }
        
        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("Only PDF, JPG, JPEG, and PNG files are allowed");
        }
    }
    
    /**
     * Check if file exists
     */
    public boolean fileExists(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }
        Path path = Paths.get(uploadDir, filePath);
        return Files.exists(path);
    }
    
    /**
     * Get file size
     */
    public long getFileSize(String filePath) throws IOException {
        Path path = Paths.get(uploadDir, filePath);
        if (!Files.exists(path)) {
            return 0;
        }
        return Files.size(path);
    }
}
