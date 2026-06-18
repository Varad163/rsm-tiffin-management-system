package com.varad.backend.controller;

import com.varad.backend.dto.StudentRequest;
import com.varad.backend.dto.StudentResponse;
import com.varad.backend.dto.StudentUpdateRequest;
import com.varad.backend.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/api/admin/students")
    public ResponseEntity<Page<StudentResponse>> getAllStudents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(studentService.getAllStudents(name, email, pageable));
    }

    @GetMapping("/api/admin/students/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PostMapping("/api/admin/students")
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.createStudent(request));
    }

    @PutMapping("/api/admin/students/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentUpdateRequest request
    ) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @DeleteMapping("/api/admin/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/api/admin/students/{id}/aadhaar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudentResponse> uploadAadhaar(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(studentService.uploadAadhaar(id, file));
    }

    @GetMapping("/api/student/profile")
    public ResponseEntity<StudentResponse> getCurrentProfile() {
        return ResponseEntity.ok(studentService.getCurrentStudentProfile());
    }

    @PutMapping("/api/student/profile")
    public ResponseEntity<StudentResponse> updateCurrentProfile(@Valid @RequestBody StudentUpdateRequest request) {
        return ResponseEntity.ok(studentService.updateCurrentStudentProfile(request));
    }

    @PostMapping(value = "/api/student/aadhaar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudentResponse> uploadCurrentAadhaar(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(studentService.uploadCurrentStudentAadhaar(file));
    }
}
