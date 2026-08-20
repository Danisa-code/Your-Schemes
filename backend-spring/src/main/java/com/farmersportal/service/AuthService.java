package com.farmersportal.service;

import com.farmersportal.dto.*;

public interface AuthService {
    SendOtpResponse sendOtp(SendOtpRequest request, String ipAddress);
    VerifyOtpResponse verifyOtp(VerifyOtpRequest request, String ipAddress);
    UserDto saveProfile(UserProfileDto profileDto);
    UserDto getCurrentUser(String email);
    void logout(String email);
}
