package com.varad.backend.service;

import com.varad.backend.dto.OrderDTO;
import com.varad.backend.dto.OrderRequest;
import com.varad.backend.dto.OrderStatusUpdateRequest;
import com.varad.backend.entity.Menu;
import com.varad.backend.entity.Order;
import com.varad.backend.entity.Student;
import com.varad.backend.entity.User;
import com.varad.backend.entity.enums.OrderStatus;
import com.varad.backend.entity.enums.Role;
import com.varad.backend.exception.AccessDeniedException;
import com.varad.backend.exception.DuplicateOrderException;
import com.varad.backend.exception.InvalidOrderStateException;
import com.varad.backend.exception.ResourceNotFoundException;
import com.varad.backend.repository.MenuRepository;
import com.varad.backend.repository.OrderRepository;
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
public class OrderService {

    private final OrderRepository orderRepository;
    private final StudentRepository studentRepository;
    private final MenuRepository menuRepository;

    @Transactional
    public OrderDTO createOrder(OrderRequest request) {
        Long studentId = resolveStudentIdForCreate(request.getStudentId());
        Student student = findStudentById(studentId);
        validateActiveStudent(student);

        Menu menu = findMenuById(request.getMenuId());

        if (orderRepository.existsByStudentIdAndMenuIdAndOrderDate(
                student.getId(), menu.getId(), request.getOrderDate())) {
            throw new DuplicateOrderException(
                    "Order already exists for student " + student.getId()
                            + " and menu " + menu.getId() + " on " + request.getOrderDate()
            );
        }

        Order order = Order.builder()
                .student(student)
                .menu(menu)
                .orderDate(request.getOrderDate())
                .quantity(request.getQuantity())
                .totalAmount(request.getTotalAmount())
                .status(OrderStatus.PENDING)
                .build();

        return mapToDTO(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrders(
            Long studentId,
            OrderStatus status,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    ) {
        return orderRepository.searchOrders(studentId, status, from, to, pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {
        return mapToDTO(findOrderById(id));
    }

    @Transactional
    public OrderDTO updateOrder(Long id, OrderRequest request) {
        Order order = findOrderById(id);
        validateOrderModifiable(order);

        Student student = findStudentById(request.getStudentId());
        Menu menu = findMenuById(request.getMenuId());

        if (orderRepository.existsByStudentIdAndMenuIdAndOrderDateAndIdNot(
                student.getId(), menu.getId(), request.getOrderDate(), id)) {
            throw new DuplicateOrderException(
                    "Order already exists for student " + student.getId()
                            + " and menu " + menu.getId() + " on " + request.getOrderDate()
            );
        }

        order.setStudent(student);
        order.setMenu(menu);
        order.setOrderDate(request.getOrderDate());
        order.setQuantity(request.getQuantity());
        order.setTotalAmount(request.getTotalAmount());

        return mapToDTO(orderRepository.save(order));
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = findOrderById(id);

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new InvalidOrderStateException("Delivered orders cannot be deleted");
        }

        orderRepository.delete(order);
    }

    @Transactional
    public OrderDTO cancelOrder(Long id) {
        Order order = findOrderById(id);
        validateOrderOwnership(order);

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException("Order is already cancelled");
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new InvalidOrderStateException("Delivered orders cannot be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapToDTO(orderRepository.save(order));
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, OrderStatusUpdateRequest request) {
        Order order = findOrderById(id);

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException("Cancelled orders cannot be updated");
        }

        if (order.getStatus() == OrderStatus.DELIVERED && request.getStatus() != OrderStatus.DELIVERED) {
            throw new InvalidOrderStateException("Delivered orders cannot change status");
        }

        order.setStatus(request.getStatus());
        return mapToDTO(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getOrdersByStudentId(
            Long studentId,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    ) {
        validateStudentCanAccess(studentId);
        findStudentById(studentId);

        if (from != null && to != null) {
            return orderRepository.findByStudentIdAndOrderDateBetween(studentId, from, to, pageable)
                    .map(this::mapToDTO);
        }

        return orderRepository.findByStudentId(studentId, pageable)
                .map(this::mapToDTO);
    }

    private Long resolveStudentIdForCreate(Long requestedStudentId) {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.ADMIN) {
            return requestedStudentId;
        }

        Student currentStudent = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        return currentStudent.getId();
    }

    private void validateActiveStudent(Student student) {
        if (!student.isActive()) {
            throw new InvalidOrderStateException("Inactive students cannot place orders");
        }
    }

    private void validateOrderModifiable(Order order) {
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException("Cancelled orders cannot be updated");
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new InvalidOrderStateException("Delivered orders cannot be updated");
        }
    }

    private void validateStudentCanAccess(Long studentId) {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        Student currentStudent = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (!currentStudent.getId().equals(studentId)) {
            throw new AccessDeniedException("You are not allowed to access orders for this student");
        }
    }

    private void validateOrderOwnership(Order order) {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        Student currentStudent = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (!order.getStudent().getId().equals(currentStudent.getId())) {
            throw new AccessDeniedException("You are not allowed to cancel this order");
        }
    }

    private Order findOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    private Student findStudentById(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
    }

    private Menu findMenuById(Long menuId) {
        return menuRepository.findById(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found with id: " + menuId));
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

    private OrderDTO mapToDTO(Order order) {
        Student student = order.getStudent();
        Menu menu = order.getMenu();

        return OrderDTO.builder()
                .id(order.getId())
                .studentId(student.getId())
                .studentEmail(student.getUser().getEmail())
                .collegeName(student.getCollegeName())
                .menuId(menu.getId())
                .menuDate(menu.getMenuDate())
                .orderDate(order.getOrderDate())
                .quantity(order.getQuantity())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
