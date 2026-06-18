package com.varad.backend.service;

import com.varad.backend.dto.DashboardDTO;
import com.varad.backend.dto.MenuDTO;
import com.varad.backend.dto.OrderDTO;
import com.varad.backend.dto.TodayAttendanceDTO;
import com.varad.backend.entity.Menu;
import com.varad.backend.entity.Order;
import com.varad.backend.repository.AttendanceRepository;
import com.varad.backend.repository.MenuRepository;
import com.varad.backend.repository.OrderRepository;
import com.varad.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int RECENT_ORDERS_LIMIT = 5;

    private final StudentRepository studentRepository;
    private final OrderRepository orderRepository;
    private final AttendanceRepository attendanceRepository;
    private final MenuRepository menuRepository;

    @Transactional(readOnly = true)
    public DashboardDTO getDashboardStatistics() {
        LocalDate today = LocalDate.now();

        return DashboardDTO.builder()
                .totalStudents(studentRepository.count())
                .activeStudents(studentRepository.countByActiveTrue())
                .totalOrders(orderRepository.count())
                .todayAttendance(getTodayAttendanceSummary(today))
                .todayMenu(getTodayMenu(today))
                .recentOrders(getRecentOrders())
                .build();
    }

    private TodayAttendanceDTO getTodayAttendanceSummary(LocalDate today) {
        return TodayAttendanceDTO.builder()
                .totalMarked(attendanceRepository.countByDate(today))
                .presentCount(attendanceRepository.countPresentByDate(today))
                .absentCount(attendanceRepository.countAbsentByDate(today))
                .build();
    }

    private MenuDTO getTodayMenu(LocalDate today) {
        return menuRepository.findByMenuDate(today)
                .map(this::mapToMenuDTO)
                .orElse(null);
    }

    private List<OrderDTO> getRecentOrders() {
        return orderRepository.findRecentOrders(PageRequest.of(0, RECENT_ORDERS_LIMIT))
                .stream()
                .map(this::mapToOrderDTO)
                .toList();
    }

    private MenuDTO mapToMenuDTO(Menu menu) {
        return MenuDTO.builder()
                .id(menu.getId())
                .menuDate(menu.getMenuDate())
                .breakfast(menu.getBreakfast())
                .lunch(menu.getLunch())
                .dinner(menu.getDinner())
                .createdAt(menu.getCreatedAt())
                .updatedAt(menu.getUpdatedAt())
                .build();
    }

    private OrderDTO mapToOrderDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .studentId(order.getStudent().getId())
                .studentEmail(order.getStudent().getUser().getEmail())
                .collegeName(order.getStudent().getCollegeName())
                .menuId(order.getMenu().getId())
                .menuDate(order.getMenu().getMenuDate())
                .orderDate(order.getOrderDate())
                .quantity(order.getQuantity())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
