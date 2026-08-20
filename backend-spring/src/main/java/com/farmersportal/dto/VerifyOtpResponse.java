package com.farmersportal.dto;

public class VerifyOtpResponse {

    private boolean success;
    private String token;
    private UserDto user;
    private boolean isNewUser;
    private String message;

    public VerifyOtpResponse() {}

    public VerifyOtpResponse(boolean success, String token, UserDto user, boolean isNewUser, String message) {
        this.success = success;
        this.token = token;
        this.user = user;
        this.isNewUser = isNewUser;
        this.message = message;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public boolean isNewUser() { return isNewUser; }
    public void setNewUser(boolean isNewUser) { this.isNewUser = isNewUser; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
