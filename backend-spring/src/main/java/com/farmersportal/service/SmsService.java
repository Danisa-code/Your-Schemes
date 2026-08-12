package com.farmersportal.service;

public interface SmsService {
    void sendSms(String mobileNumber, String otp, String formattedMessage) throws Exception;
}
