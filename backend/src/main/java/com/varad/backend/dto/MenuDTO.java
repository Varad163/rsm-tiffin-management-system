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
public class MenuDTO {

    private Long id;
    private LocalDate menuDate;
    private String breakfast;
    private String lunch;
    private String dinner;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
