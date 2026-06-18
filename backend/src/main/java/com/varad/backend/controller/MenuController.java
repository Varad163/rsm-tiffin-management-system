package com.varad.backend.controller;

import com.varad.backend.dto.MenuDTO;
import com.varad.backend.dto.MenuRequest;
import com.varad.backend.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @PostMapping
    public ResponseEntity<MenuDTO> createMenu(@Valid @RequestBody MenuRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.createMenu(request));
    }

    @GetMapping
    public ResponseEntity<Page<MenuDTO>> getAllMenus(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 10, sort = "menuDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(menuService.getAllMenus(from, to, pageable));
    }

    @GetMapping("/today")
    public ResponseEntity<MenuDTO> getTodayMenu() {
        return ResponseEntity.ok(menuService.getTodayMenu());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuDTO> getMenuById(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getMenuById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuDTO> updateMenu(
            @PathVariable Long id,
            @Valid @RequestBody MenuRequest request
    ) {
        return ResponseEntity.ok(menuService.updateMenu(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ResponseEntity.noContent().build();
    }
}
