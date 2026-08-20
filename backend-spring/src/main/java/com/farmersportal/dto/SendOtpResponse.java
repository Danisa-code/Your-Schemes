package com.farmersportal.dto;

public class SendOtpResponse {

    private boolean success;
    private String message;
    private String verificationId;

    public SendOtpResponse() {}

    public SendOtpResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public SendOtpResponse(boolean success, String message, String verificationId) {
        this.success = success;
        this.message = message;
        this.verificationId = verificationId;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getVerificationId() { return verificationId; }
    public void setVerificationId(String verificationId) { this.verificationId = verificationId; }
}

