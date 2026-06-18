package com.varad.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDTO {

    private Long id;
    private Long studentId;
    private String studentEmail;
    private String collegeName;
    private LocalDate date;
    private boolean present;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
