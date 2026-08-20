package com.farmersportal.service;

public interface OtpGatewayService {
    /**
     * Calls OTP Gateway PUT /api/otp/{id} to generate and dispatch an OTP to the target address.
     * @param verificationId Unique tracking ID for the OTP request.
     * @param mobileNumber Target E.164 phone number.
     * @return true if OTP Gateway initiated the request successfully.
     */
    boolean requestOtp(String verificationId, String mobileNumber);

    /**
     * Calls OTP Gateway POST /api/otp/{id} with action=check to verify the user-entered OTP.
     * @param verificationId Unique tracking ID for the OTP request.
     * @param otp The 6-digit OTP entered by the user.
     * @return true if OTP Gateway confirmed the OTP is valid.
     */
    boolean verifyOtp(String verificationId, String otp);
}
