package com.varad.backend.repository;

import com.varad.backend.entity.Order;
import com.varad.backend.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByStudentId(Long studentId, Pageable pageable);

    Page<Order> findByStudentIdAndOrderDateBetween(
            Long studentId,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    );

    boolean existsByStudentIdAndMenuIdAndOrderDate(Long studentId, Long menuId, LocalDate orderDate);

    boolean existsByStudentIdAndMenuIdAndOrderDateAndIdNot(
            Long studentId,
            Long menuId,
            LocalDate orderDate,
            Long id
    );

    @Query("""
            SELECT o FROM Order o
            JOIN o.student s
            WHERE (:studentId IS NULL OR s.id = :studentId)
            AND (:status IS NULL OR o.status = :status)
            AND (:from IS NULL OR o.orderDate >= :from)
            AND (:to IS NULL OR o.orderDate <= :to)
            """)
    Page<Order> searchOrders(
            @Param("studentId") Long studentId,
            @Param("status") OrderStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable
    );
}
