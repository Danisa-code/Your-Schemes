package com.farmersportal.service;

public interface WpSmsService {
    /**
     * Sends an OTP SMS to the recipient mobile number using WP-SMS REST API gateway.
     *
     * @param verificationId Unique tracking ID for this verification attempt
     * @param mobileNumber E.164 normalized mobile number (+91XXXXXXXXXX)
     * @param otpCode 6-digit generated OTP code
     * @return true if SMS dispatch succeeded or accepted by WP-SMS gateway
     */
    boolean sendOtp(String verificationId, String mobileNumber, String otpCode);
}
