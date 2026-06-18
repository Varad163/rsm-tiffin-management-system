package com.varad.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuRequest {

    @NotNull(message = "Menu date is required")
    private LocalDate menuDate;

    @NotBlank(message = "Breakfast menu is required")
    private String breakfast;

    @NotBlank(message = "Lunch menu is required")
    private String lunch;

    @NotBlank(message = "Dinner menu is required")
    private String dinner;
}
