package com.farmersportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    private String icon;

    @Column(nullable = false)
    private Boolean unread;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Notification() {}

    public Notification(Long id, String title, String message, String icon, Boolean unread, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.icon = icon;
        this.unread = unread;
        this.createdAt = createdAt;
    }

    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (unread == null) {
            unread = true;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public Boolean getUnread() { return unread; }
    public void setUnread(Boolean unread) { this.unread = unread; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class NotificationBuilder {
        private Long id;
        private String title;
        private String message;
        private String icon;
        private Boolean unread;
        private LocalDateTime createdAt;

        NotificationBuilder() {}

        public NotificationBuilder id(Long id) { this.id = id; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder icon(String icon) { this.icon = icon; return this; }
        public NotificationBuilder unread(Boolean unread) { this.unread = unread; return this; }
        public NotificationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Notification build() {
            return new Notification(id, title, message, icon, unread, createdAt);
        }
    }
}
