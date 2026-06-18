package com.varad.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponse {

    private Long id;
    private Long userId;
    private String email;
    private String phone;
    private String address;
    private String aadhaarImage;
    private String collegeName;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
