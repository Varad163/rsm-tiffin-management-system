package com.varad.backend.service;

import com.varad.backend.dto.MenuDTO;
import com.varad.backend.dto.MenuRequest;
import com.varad.backend.entity.Menu;
import com.varad.backend.exception.DuplicateMenuException;
import com.varad.backend.exception.ResourceNotFoundException;
import com.varad.backend.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;

    @Transactional
    public MenuDTO createMenu(MenuRequest request) {
        if (menuRepository.existsByMenuDate(request.getMenuDate())) {
            throw new DuplicateMenuException("Menu already exists for date: " + request.getMenuDate());
        }

        Menu menu = Menu.builder()
                .menuDate(request.getMenuDate())
                .breakfast(request.getBreakfast())
                .lunch(request.getLunch())
                .dinner(request.getDinner())
                .build();

        return mapToDTO(menuRepository.save(menu));
    }

    @Transactional(readOnly = true)
    public Page<MenuDTO> getAllMenus(LocalDate from, LocalDate to, Pageable pageable) {
        return menuRepository.searchMenus(from, to, pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public MenuDTO getMenuById(Long id) {
        return mapToDTO(findMenuById(id));
    }

    @Transactional(readOnly = true)
    public MenuDTO getTodayMenu() {
        return menuRepository.findByMenuDate(LocalDate.now())
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found for today"));
    }

    @Transactional
    public MenuDTO updateMenu(Long id, MenuRequest request) {
        Menu menu = findMenuById(id);

        if (menuRepository.existsByMenuDateAndIdNot(request.getMenuDate(), id)) {
            throw new DuplicateMenuException("Menu already exists for date: " + request.getMenuDate());
        }

        menu.setMenuDate(request.getMenuDate());
        menu.setBreakfast(request.getBreakfast());
        menu.setLunch(request.getLunch());
        menu.setDinner(request.getDinner());

        return mapToDTO(menuRepository.save(menu));
    }

    @Transactional
    public void deleteMenu(Long id) {
        Menu menu = findMenuById(id);
        menuRepository.delete(menu);
    }

    private Menu findMenuById(Long id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found with id: " + id));
    }

    private MenuDTO mapToDTO(Menu menu) {
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
}
