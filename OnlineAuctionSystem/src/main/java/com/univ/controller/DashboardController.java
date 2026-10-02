package com.univ.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.univ.dto.DashboardDTO;
import com.univ.service.DashboardService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/dashboard")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;


    @GetMapping("/my")
    public DashboardDTO getMyDashboard(
            Authentication authentication) {

        String username = authentication.getName();

        return dashboardService.getUserDashboard(username);
    }
}