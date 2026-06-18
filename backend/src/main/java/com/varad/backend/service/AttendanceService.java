package com.varad.backend.service;

import com.varad.backend.dto.AttendanceDTO;
import com.varad.backend.dto.AttendanceRequest;
import com.varad.backend.entity.Attendance;
import com.varad.backend.entity.Student;
import com.varad.backend.entity.User;
import com.varad.backend.entity.enums.Role;
import com.varad.backend.exception.AccessDeniedException;
import com.varad.backend.exception.DuplicateAttendanceException;
import com.varad.backend.exception.ResourceNotFoundException;
import com.varad.backend.repository.AttendanceRepository;
import com.varad.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public AttendanceDTO createAttendance(AttendanceRequest request) {
        Student student = findStudentById(request.getStudentId());

        if (attendanceRepository.existsByStudentIdAndDate(student.getId(), request.getDate())) {
            throw new DuplicateAttendanceException(
                    "Attendance already exists for student " + student.getId() + " on " + request.getDate()
            );
        }

        Attendance attendance = Attendance.builder()
                .student(student)
                .date(request.getDate())
                .present(request.getPresent())
                .build();

        return mapToDTO(attendanceRepository.save(attendance));
    }

    @Transactional(readOnly = true)
    public Page<AttendanceDTO> getAllAttendance(
            Long studentId,
            LocalDate from,
            LocalDate to,
            Boolean present,
            Pageable pageable
    ) {
        return attendanceRepository.searchAttendance(studentId, from, to, present, pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public AttendanceDTO getAttendanceById(Long id) {
        return mapToDTO(findAttendanceById(id));
    }

    @Transactional
    public AttendanceDTO updateAttendance(Long id, AttendanceRequest request) {
        Attendance attendance = findAttendanceById(id);
        Student student = findStudentById(request.getStudentId());

        if (attendanceRepository.existsByStudentIdAndDateAndIdNot(
                student.getId(), request.getDate(), id)) {
            throw new DuplicateAttendanceException(
                    "Attendance already exists for student " + student.getId() + " on " + request.getDate()
            );
        }

        attendance.setStudent(student);
        attendance.setDate(request.getDate());
        attendance.setPresent(request.getPresent());

        return mapToDTO(attendanceRepository.save(attendance));
    }

    @Transactional
    public void deleteAttendance(Long id) {
        Attendance attendance = findAttendanceById(id);
        attendanceRepository.delete(attendance);
    }

    @Transactional(readOnly = true)
    public Page<AttendanceDTO> getAttendanceByStudentId(
            Long studentId,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    ) {
        validateStudentAccess(studentId);
        findStudentById(studentId);

        if (from != null && to != null) {
            return attendanceRepository.findByStudentIdAndDateBetween(studentId, from, to, pageable)
                    .map(this::mapToDTO);
        }

        return attendanceRepository.findByStudentId(studentId, pageable)
                .map(this::mapToDTO);
    }

    private void validateStudentAccess(Long studentId) {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        Student currentStudent = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (!currentStudent.getId().equals(studentId)) {
            throw new AccessDeniedException("You are not allowed to view attendance for this student");
        }
    }

    private Attendance findAttendanceById(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
    }

    private Student findStudentById(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
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

    private AttendanceDTO mapToDTO(Attendance attendance) {
        Student student = attendance.getStudent();

        return AttendanceDTO.builder()
                .id(attendance.getId())
                .studentId(student.getId())
                .studentEmail(student.getUser().getEmail())
                .collegeName(student.getCollegeName())
                .date(attendance.getDate())
                .present(attendance.isPresent())
                .createdAt(attendance.getCreatedAt())
                .updatedAt(attendance.getUpdatedAt())
                .build();
    }
}
