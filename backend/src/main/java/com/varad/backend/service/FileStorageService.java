package com.varad.backend.service;

import com.varad.backend.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/pdf"
    );

    private final Path uploadDir;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create upload directory", ex);
        }
    }

    public String storeAadhaarImage(MultipartFile file) {
        validateFile(file);

        String extension = getFileExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;
        Path targetLocation = uploadDir.resolve(filename);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file: " + filename, ex);
        }
    }

    public void deleteFile(String filename) {
        if (!StringUtils.hasText(filename)) {
            return;
        }

        try {
            Files.deleteIfExists(uploadDir.resolve(filename));
        } catch (IOException ex) {
            throw new FileStorageException("Could not delete file: " + filename, ex);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new FileStorageException("Only JPEG, PNG, and PDF files are allowed");
        }
    }

    private String getFileExtension(String filename) {
        if (!StringUtils.hasText(filename) || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}
