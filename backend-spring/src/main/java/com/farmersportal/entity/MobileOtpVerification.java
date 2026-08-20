package com.farmersportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mobile_otp_verifications", indexes = {
    @Index(name = "idx_mobile_otp_number", columnList = "mobile_number")
})
public class MobileOtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mobile_number", nullable = false)
    private String mobileNumber;

    @Column(name = "hashed_otp", nullable = false)
    private String hashedOtp;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(name = "resend_count", nullable = false)
    private int resendCount = 0;

    @Column(name = "last_resend_at")
    private LocalDateTime lastResendAt;

    @Column(nullable = false)
    private boolean verified = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public MobileOtpVerification() {}

    public MobileOtpVerification(String mobileNumber, String hashedOtp, LocalDateTime expiresAt) {
        this.mobileNumber = mobileNumber;
        this.hashedOtp = hashedOtp;
        this.expiresAt = expiresAt;
        this.attempts = 0;
        this.verified = false;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.lastResendAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getHashedOtp() { return hashedOtp; }
    public void setHashedOtp(String hashedOtp) { this.hashedOtp = hashedOtp; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }

    public int getResendCount() { return resendCount; }
    public void setResendCount(int resendCount) { this.resendCount = resendCount; }

    public LocalDateTime getLastResendAt() { return lastResendAt; }
    public void setLastResendAt(LocalDateTime lastResendAt) { this.lastResendAt = lastResendAt; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
