package com.varad.backend.controller;

import com.varad.backend.dto.AadhaarUploadResponse;
import com.varad.backend.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @PostMapping(value = "/{id}/aadhaar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AadhaarUploadResponse> uploadAadhaar(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(fileUploadService.uploadAadhaar(id, file));
    }
}
