package com.farmersportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_mobile", columnList = "mobile_number", unique = true)
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    @Column(nullable = true)
    private String password;

    @Column(nullable = true, unique = true)
    private String email;

    private String role = "FARMER";

    private String name;
    
    @Column(name = "mobile_number", unique = true)
    private String mobileNumber;

    private String state = "Tamil Nadu";
    private String district;
    private String taluk;
    private String village;

    @Column(name = "preferred_language")
    private String preferredLanguage = "Tamil";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    public User() {}

    public User(Long id, String username, String password, String email, String role, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role != null ? role : "FARMER";
        this.createdAt = createdAt;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getTaluk() { return taluk; }
    public void setTaluk(String taluk) { this.taluk = taluk; }
    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    // Simple Builder
    public static class UserBuilder {
        private Long id;
        private String username;
        private String password;
        private String email;
        private String role = "FARMER";
        private String name;
        private String mobileNumber;
        private String state;
        private String district;
        private String taluk;
        private String village;
        private String preferredLanguage = "Tamil";
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        UserBuilder() {}

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder mobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; return this; }
        public UserBuilder state(String state) { this.state = state; return this; }
        public UserBuilder district(String district) { this.district = district; return this; }
        public UserBuilder taluk(String taluk) { this.taluk = taluk; return this; }
        public UserBuilder village(String village) { this.village = village; return this; }
        public UserBuilder preferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public User build() {
            User u = new User(id, username, password, email, role, createdAt);
            u.setName(name);
            u.setMobileNumber(mobileNumber);
            u.setState(state);
            u.setDistrict(district);
            u.setTaluk(taluk);
            u.setVillage(village);
            if (preferredLanguage != null) u.setPreferredLanguage(preferredLanguage);
            if (updatedAt != null) u.setUpdatedAt(updatedAt);
            return u;
        }
    }
}

