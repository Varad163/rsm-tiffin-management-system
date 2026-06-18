package com.varad.backend.service;

import com.varad.backend.dto.StudentRequest;
import com.varad.backend.dto.StudentResponse;
import com.varad.backend.dto.StudentUpdateRequest;
import com.varad.backend.entity.Student;
import com.varad.backend.entity.User;
import com.varad.backend.entity.enums.Role;
import com.varad.backend.exception.EmailAlreadyExistsException;
import com.varad.backend.exception.ResourceNotFoundException;
import com.varad.backend.repository.StudentRepository;
import com.varad.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public Page<StudentResponse> getAllStudents(String name, String email, Pageable pageable) {
        return studentRepository.searchByNameAndEmail(name, email, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudentById(Long id) {
        return mapToResponse(findStudentById(id));
    }

    @Transactional(readOnly = true)
    public StudentResponse getCurrentStudentProfile() {
        return mapToResponse(findStudentByEmail(getCurrentUserEmail()));
    }

    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        if (!StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("Password is required when creating a student");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .enabled(request.isActive())
                .build();

        userRepository.save(user);

        Student student = Student.builder()
                .user(user)
                .phone(request.getPhone())
                .address(request.getAddress())
                .collegeName(request.getCollegeName())
                .active(request.isActive())
                .build();

        return mapToResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentUpdateRequest request) {
        Student student = findStudentById(id);
        applyUpdate(student, request);
        syncUserEnabledStatus(student);
        return mapToResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse updateCurrentStudentProfile(StudentUpdateRequest request) {
        Student student = findStudentByEmail(getCurrentUserEmail());
        applyUpdate(student, request);
        return mapToResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse uploadAadhaar(Long id, MultipartFile file) {
        Student student = findStudentById(id);
        return saveAadhaarImage(student, file);
    }

    @Transactional
    public StudentResponse uploadCurrentStudentAadhaar(MultipartFile file) {
        Student student = findStudentByEmail(getCurrentUserEmail());
        return saveAadhaarImage(student, file);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = findStudentById(id);

        student.setActive(false);
        student.getUser().setEnabled(false);

        studentRepository.save(student);
        userRepository.save(student.getUser());
    }

    private StudentResponse saveAadhaarImage(Student student, MultipartFile file) {
        if (StringUtils.hasText(student.getAadhaarImage())) {
            fileStorageService.deleteFile(student.getAadhaarImage());
        }

        String storedFilename = fileStorageService.storeAadhaarImage(file);
        student.setAadhaarImage(storedFilename);
        return mapToResponse(studentRepository.save(student));
    }

    private void applyUpdate(Student student, StudentUpdateRequest request) {
        if (request.getPhone() != null) {
            student.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            student.setAddress(request.getAddress());
        }
        if (request.getCollegeName() != null) {
            student.setCollegeName(request.getCollegeName());
        }
        if (request.getActive() != null) {
            student.setActive(request.getActive());
            syncUserEnabledStatus(student);
        }
    }

    private void syncUserEnabledStatus(Student student) {
        student.getUser().setEnabled(student.isActive());
        userRepository.save(student.getUser());
    }

    private Student findStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    private Student findStudentByEmail(String email) {
        return studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + email));
    }

    private String getCurrentUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        throw new ResourceNotFoundException("Authenticated user not found");
    }

    private StudentResponse mapToResponse(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .email(student.getUser().getEmail())
                .phone(student.getPhone())
                .address(student.getAddress())
                .aadhaarImage(student.getAadhaarImage())
                .collegeName(student.getCollegeName())
                .active(student.isActive())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }
}
