package com.univ.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.univ.entity.Auction;
import com.univ.entity.Notification;
import com.univ.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Create notification
    public Notification createNotification(
            String username,
            String message,
            Auction auction) {

        Notification notification = new Notification();

        notification.setUsername(username);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setAuction(auction);

        return notificationRepository.save(notification);
    }

    // Get all notifications
    public List<Notification> getMyNotifications(
            String username) {

        return notificationRepository
                .findByUsernameOrderByCreatedAtDesc(username);
    }

    // Get unread notifications
    public List<Notification> getUnreadNotifications(
            String username) {

        return notificationRepository
                .findByUsernameAndIsReadFalseOrderByCreatedAtDesc(
                        username);
    }

    // Mark one notification as read
    public Notification markAsRead(
            Long notificationId,
            String username) {

        Notification notification =
                notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Notification not found"));

        // User can only modify his own notification
        if (!notification.getUsername()
                .equals(username)) {

            throw new RuntimeException(
                    "You cannot modify this notification");
        }

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    // Mark all notifications as read
    public void markAllAsRead(String username) {

        List<Notification> notifications =
                notificationRepository
                .findByUsernameAndIsReadFalseOrderByCreatedAtDesc(
                        username);

        for (Notification notification : notifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(notifications);
    }
}

