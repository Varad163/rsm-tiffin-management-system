package com.varad.backend.service;

import com.varad.backend.dto.AadhaarUploadResponse;
import com.varad.backend.entity.Student;
import com.varad.backend.entity.User;
import com.varad.backend.entity.enums.Role;
import com.varad.backend.exception.AccessDeniedException;
import com.varad.backend.exception.FileStorageException;
import com.varad.backend.exception.ResourceNotFoundException;
import com.varad.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "pdf");

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/pdf"
    );

    private final StudentRepository studentRepository;
    private final Path uploadDir;
    private final String relativeUploadDir;

    public FileUploadService(
            StudentRepository studentRepository,
            @Value("${app.upload.dir}") String uploadDirPath
    ) {
        this.studentRepository = studentRepository;
        this.relativeUploadDir = uploadDirPath.replace("\\", "/");
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create upload directory", ex);
        }
    }

    @Transactional
    public AadhaarUploadResponse uploadAadhaar(Long studentId, MultipartFile file) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        validateStudentAccess(student);
        validateFile(file);

        if (StringUtils.hasText(student.getAadhaarImage())) {
            deleteExistingFile(student.getAadhaarImage());
        }

        String storedFilename = storeFile(file);
        String filePath = relativeUploadDir + "/" + storedFilename;

        student.setAadhaarImage(filePath);
        studentRepository.save(student);

        return AadhaarUploadResponse.builder()
                .filePath(filePath)
                .build();
    }

    private void validateStudentAccess(Student student) {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        Student currentStudent = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (!currentStudent.getId().equals(student.getId())) {
            throw new AccessDeniedException("You are not allowed to upload Aadhaar for this student");
        }
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof User user) {
            return user;
        }

        if (principal instanceof UserDetails userDetails) {
            return studentRepository.findByUserEmail(userDetails.getUsername())
                    .map(Student::getUser)
                    .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        }

        throw new ResourceNotFoundException("Authenticated user not found");
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new FileStorageException("File size must not exceed 5MB");
        }

        String extension = getFileExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new FileStorageException("Only JPG, JPEG, PNG, and PDF files are allowed");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new FileStorageException("Only JPG, JPEG, PNG, and PDF files are allowed");
        }
    }

    private String storeFile(MultipartFile file) {
        String extension = getFileExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + extension;
        Path targetLocation = uploadDir.resolve(filename);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file: " + filename, ex);
        }
    }

    private void deleteExistingFile(String filePath) {
        if (!StringUtils.hasText(filePath)) {
            return;
        }

        String filename = Paths.get(filePath).getFileName().toString();
        try {
            Files.deleteIfExists(uploadDir.resolve(filename));
        } catch (IOException ex) {
            throw new FileStorageException("Could not delete existing file: " + filename, ex);
        }
    }

    private String getFileExtension(String filename) {
        if (!StringUtils.hasText(filename) || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
