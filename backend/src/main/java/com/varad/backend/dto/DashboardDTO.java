package com.varad.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {

    private long totalStudents;
    private long activeStudents;
    private long totalOrders;
    private TodayAttendanceDTO todayAttendance;
    private MenuDTO todayMenu;
    private List<OrderDTO> recentOrders;
}
