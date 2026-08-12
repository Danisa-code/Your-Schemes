package com.farmersportal.dto;

public class SendOtpRequest {

    private String email;
    private String mobileNumber;

    public SendOtpRequest() {}

    public SendOtpRequest(String identifier) {
        if (identifier != null && identifier.contains("@")) {
            this.email = identifier;
        } else {
            this.mobileNumber = identifier;
        }
    }

    public SendOtpRequest(String email, String mobileNumber) {
        this.email = email;
        this.mobileNumber = mobileNumber;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
}
