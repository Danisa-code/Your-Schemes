package com.farmersportal;

import com.farmersportal.dto.*;
import com.farmersportal.entity.MobileOtpVerification;
import com.farmersportal.entity.User;
import com.farmersportal.repository.MobileOtpVerificationRepository;
import com.farmersportal.repository.UserRepository;
import com.farmersportal.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private MobileOtpVerificationRepository mobileOtpVerificationRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        mobileOtpVerificationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Test 1: Valid Indian Mobile Number send OTP success with normalization")
    void testSendMobileOtpValid() {
        SendOtpRequest request = new SendOtpRequest("9876543210");
        SendOtpResponse response = authService.sendOtp(request, "127.0.0.1");

        assertTrue(response.isSuccess());
        assertEquals("OTP sent successfully", response.getMessage());

        MobileOtpVerification otpRecord = mobileOtpVerificationRepository.findTopByMobileNumberOrderByCreatedAtDesc("+919876543210").orElseThrow();
        assertNotNull(otpRecord.getHashedOtp());
        assertFalse(otpRecord.isVerified());
    }

    @Test
    @DisplayName("Test 2: Invalid Indian mobile number fails validation")
    void testSendMobileOtpInvalid() {
        SendOtpRequest request = new SendOtpRequest("12345");
        assertThrows(IllegalArgumentException.class, () -> {
            authService.sendOtp(request, "127.0.0.1");
        });
    }

    @Test
    @DisplayName("Test 3: Incorrect Mobile OTP verification fails with Tamil error")
    void testVerifyIncorrectMobileOtp() {
        String mobile = "+919876543211";
        authService.sendOtp(new SendOtpRequest(mobile), "127.0.0.1");

        VerifyOtpRequest verifyReq = new VerifyOtpRequest(mobile, "000000");
        VerifyOtpResponse response = authService.verifyOtp(verifyReq, "127.0.0.1");

        assertFalse(response.isSuccess());
        assertEquals("OTP தவறாக உள்ளது. மீண்டும் முயற்சிக்கவும்.", response.getMessage());
    }

    @Test
    @DisplayName("Test 4: Expired Mobile OTP rejection")
    void testExpiredMobileOtpRejection() {
        String mobile = "+919876543212";
        authService.sendOtp(new SendOtpRequest(mobile), "127.0.0.1");

        MobileOtpVerification otpRecord = mobileOtpVerificationRepository.findTopByMobileNumberOrderByCreatedAtDesc(mobile).orElseThrow();
        otpRecord.setExpiresAt(LocalDateTime.now().minusMinutes(10));
        mobileOtpVerificationRepository.save(otpRecord);

        VerifyOtpResponse response = authService.verifyOtp(new VerifyOtpRequest(mobile, "123456"), "127.0.0.1");
        assertFalse(response.isSuccess());
        assertEquals("OTP காலாவதியாகிவிட்டது. புதிய OTP பெறவும்.", response.getMessage());
    }

    @Test
    @DisplayName("Test 5: Maximum verification attempts (5 attempts) lockout")
    void testMaxVerificationAttemptsLockout() {
        String mobile = "+919876543213";
        authService.sendOtp(new SendOtpRequest(mobile), "127.0.0.1");

        VerifyOtpRequest verifyReq = new VerifyOtpRequest(mobile, "111111");

        // Fail 5 times
        for (int i = 0; i < 5; i++) {
            VerifyOtpResponse response = authService.verifyOtp(verifyReq, "127.0.0.1");
            assertFalse(response.isSuccess());
            if (i == 4) {
                assertEquals("பல முறை முயற்சிக்கப்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும்.", response.getMessage());
            } else {
                assertEquals("OTP தவறாக உள்ளது. மீண்டும் முயற்சிக்கவும்.", response.getMessage());
            }
        }

        // 6th attempt should block immediately with lockout message
        VerifyOtpResponse response6 = authService.verifyOtp(verifyReq, "127.0.0.1");
        assertFalse(response6.isSuccess());
        assertEquals("பல முறை முயற்சிக்கப்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும்.", response6.getMessage());
    }

    @Test
    @DisplayName("Test 6: Resend OTP cooldown active error")
    void testResendOtpCooldownActive() {
        String mobile = "9876543214";
        SendOtpRequest request = new SendOtpRequest(mobile);
        authService.sendOtp(request, "127.0.0.1");

        // Attempting to resend immediately should trigger cooldown error
        assertThrows(IllegalStateException.class, () -> {
            authService.sendOtp(request, "127.0.0.1");
        });
    }

    @Test
    @DisplayName("Test 7: Previous OTP becomes invalid when a new OTP is generated")
    void testPreviousOtpInvalidation() {
        String mobile = "9876543215";
        SendOtpRequest request = new SendOtpRequest(mobile);
        
        authService.sendOtp(request, "127.0.0.1");
        MobileOtpVerification record1 = mobileOtpVerificationRepository.findTopByMobileNumberOrderByCreatedAtDesc("+919876543215").orElseThrow();
        
        // Fast forward last resend to bypass cooldown for testing
        record1.setLastResendAt(LocalDateTime.now().minusSeconds(100));
        mobileOtpVerificationRepository.save(record1);

        // Request a new OTP
        authService.sendOtp(request, "127.0.0.1");

        // The first record should now be marked as verified/invalidated
        MobileOtpVerification updatedRecord1 = mobileOtpVerificationRepository.findById(record1.getId()).orElseThrow();
        assertTrue(updatedRecord1.isVerified());
    }

    @Test
    @DisplayName("Test 8: New vs Existing farmer registration flows")
    void testNewVsExistingFarmerFlows() {
        String mobile = "9876543216";
        String normalized = "+919876543216";
        authService.sendOtp(new SendOtpRequest(mobile), "127.0.0.1");

        MobileOtpVerification otpRecord = mobileOtpVerificationRepository.findTopByMobileNumberOrderByCreatedAtDesc(normalized).orElseThrow();
        String dummyOtp = "555555";
        otpRecord.setHashedOtp(hashDummyOtp(dummyOtp, normalized));
        mobileOtpVerificationRepository.save(otpRecord);

        // Verify OTP - should return isNewUser = true since it's the first time
        VerifyOtpResponse responseNew = authService.verifyOtp(new VerifyOtpRequest(mobile, dummyOtp), "127.0.0.1");
        assertTrue(responseNew.isSuccess());
        assertTrue(responseNew.isNewUser());
        assertNotNull(responseNew.getToken());
        assertNotNull(responseNew.getUser());

        // Update profile (simulate registration)
        UserProfileDto profileDto = new UserProfileDto();
        profileDto.setMobileNumber(mobile);
        profileDto.setName("Anbumani");
        profileDto.setDistrict("Salem");
        profileDto.setTaluk("Mettur");
        profileDto.setVillage("Kolathur");
        profileDto.setPreferredLanguage("Tamil");
        authService.saveProfile(profileDto);

        // Fast forward the cooldown for the first OTP record
        otpRecord.setLastResendAt(LocalDateTime.now().minusSeconds(100));
        mobileOtpVerificationRepository.save(otpRecord);

        // Generate a new OTP request for the existing user
        authService.sendOtp(new SendOtpRequest(mobile), "127.0.0.1");
        MobileOtpVerification otpRecordExisting = mobileOtpVerificationRepository.findTopByMobileNumberOrderByCreatedAtDesc(normalized).orElseThrow();
        otpRecordExisting.setHashedOtp(hashDummyOtp(dummyOtp, normalized));
        mobileOtpVerificationRepository.save(otpRecordExisting);

        // Verify OTP again - should return isNewUser = false since registration is complete
        VerifyOtpResponse responseExisting = authService.verifyOtp(new VerifyOtpRequest(mobile, dummyOtp), "127.0.0.1");
        assertTrue(responseExisting.isSuccess());
        assertFalse(responseExisting.isNewUser());
    }

    private String hashDummyOtp(String otp, String target) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            String salt = "TN_FARMER_PORTAL_SALT_" + target.toLowerCase().trim();
            byte[] hash = digest.digest((salt + ":" + otp).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
