package com.univ.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.univ.entity.Notification;
import com.univ.service.NotificationService;

@RestController
@RequestMapping("/notification")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get all notifications
    @GetMapping("/my")
    public List<Notification> getMyNotifications(
            Authentication authentication) {

        return notificationService.getMyNotifications(
                authentication.getName());
    }

    // Get unread notifications
    @GetMapping("/unread")
    public List<Notification> getUnreadNotifications(
            Authentication authentication) {

        return notificationService.getUnreadNotifications(
                authentication.getName());
    }

    // Mark one notification as read
    @PutMapping("/read/{id}")
    public Notification markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        return notificationService.markAsRead(
                id,
                authentication.getName());
    }

    // Mark all as read
    @PutMapping("/read-all")
    public String markAllAsRead(
            Authentication authentication) {

        notificationService.markAllAsRead(
                authentication.getName());

        return "All notifications marked as read";
    }
}
