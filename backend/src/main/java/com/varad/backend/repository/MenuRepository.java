package com.varad.backend.repository;

import com.varad.backend.entity.Menu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {

    Optional<Menu> findByMenuDate(LocalDate menuDate);

    boolean existsByMenuDate(LocalDate menuDate);

    boolean existsByMenuDateAndIdNot(LocalDate menuDate, Long id);

    @Query("""
            SELECT m FROM Menu m
            WHERE (:from IS NULL OR m.menuDate >= :from)
            AND (:to IS NULL OR m.menuDate <= :to)
            """)
    Page<Menu> searchMenus(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable
    );
}
