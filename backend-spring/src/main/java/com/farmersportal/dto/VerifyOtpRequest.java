package com.farmersportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyOtpRequest {

    private String email;
    private String mobileNumber;
    private String verificationId;

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^\\d{6}$", message = "OTP must be a 6-digit number")
    private String otp;

    public VerifyOtpRequest() {}

    public VerifyOtpRequest(String identifier, String otp) {
        if (identifier != null && identifier.contains("@")) {
            this.email = identifier;
        } else {
            this.mobileNumber = identifier;
        }
        this.otp = otp;
    }

    public VerifyOtpRequest(String identifier, String otp, String verificationId) {
        this(identifier, otp);
        this.verificationId = verificationId;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getVerificationId() { return verificationId; }
    public void setVerificationId(String verificationId) { this.verificationId = verificationId; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}

