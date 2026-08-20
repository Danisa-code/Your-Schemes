package com.farmersportal.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otp) throws Exception;
}
