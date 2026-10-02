package com.univ.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.univ.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUsernameOrderByCreatedAtDesc(
            String username);

    List<Notification> findByUsernameAndIsReadFalseOrderByCreatedAtDesc(
            String username);
}

