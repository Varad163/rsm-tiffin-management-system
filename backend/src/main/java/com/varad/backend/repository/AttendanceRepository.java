package com.varad.backend.repository;

import com.varad.backend.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Page<Attendance> findByStudentId(Long studentId, Pageable pageable);

    Page<Attendance> findByStudentIdAndDateBetween(
            Long studentId,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    );

    boolean existsByStudentIdAndDate(Long studentId, LocalDate date);

    boolean existsByStudentIdAndDateAndIdNot(Long studentId, LocalDate date, Long id);

    @Query("""
            SELECT a FROM Attendance a
            JOIN a.student s
            JOIN s.user u
            WHERE (:studentId IS NULL OR s.id = :studentId)
            AND (:from IS NULL OR a.date >= :from)
            AND (:to IS NULL OR a.date <= :to)
            AND (:present IS NULL OR a.present = :present)
            """)
    Page<Attendance> searchAttendance(
            @Param("studentId") Long studentId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("present") Boolean present,
            Pageable pageable
    );

    Optional<Attendance> findByIdAndStudentId(Long id, Long studentId);
}
