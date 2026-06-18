package com.varad.backend.repository;

import com.varad.backend.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUserId(Long userId);

    Optional<Student> findByUserEmail(String email);

    boolean existsByUserId(Long userId);

    long countByActiveTrue();

    @Query("""
            SELECT s FROM Student s
            JOIN s.user u
            WHERE (:name IS NULL OR :name = '' OR LOWER(s.collegeName) LIKE LOWER(CONCAT('%', :name, '%')))
            AND (:email IS NULL OR :email = '' OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%')))
            """)
    Page<Student> searchByNameAndEmail(
            @Param("name") String name,
            @Param("email") String email,
            Pageable pageable
    );
}
