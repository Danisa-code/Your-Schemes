package com.farmersportal.serviceImpl;

import com.farmersportal.dto.*;
import com.farmersportal.entity.LoginAttempt;
import com.farmersportal.entity.MobileOtpVerification;
import com.farmersportal.entity.OtpVerification;
import com.farmersportal.entity.User;
import com.farmersportal.repository.LoginAttemptRepository;
import com.farmersportal.repository.MobileOtpVerificationRepository;
import com.farmersportal.repository.OtpVerificationRepository;
import com.farmersportal.repository.UserRepository;
import com.farmersportal.service.AuthService;
import com.farmersportal.service.EmailService;
import com.farmersportal.service.JwtService;
import com.farmersportal.service.SmsService;
import com.farmersportal.service.WpSmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern INDIAN_MOBILE_PATTERN = Pattern.compile("^\\+91[6-9]\\d{9}$");

    private static final int MAX_ATTEMPTS = 5;
    private static final int COOLDOWN_SECONDS = 45;
    private static final int EXPIRATION_MINUTES = 5;

    @Value("${app.domain:localhost:3000}")
    private String appDomain;

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final MobileOtpVerificationRepository mobileOtpVerificationRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final JwtService jwtService;
    private final WpSmsService wpSmsService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(UserRepository userRepository,
                           OtpVerificationRepository otpVerificationRepository,
                           MobileOtpVerificationRepository mobileOtpVerificationRepository,
                           LoginAttemptRepository loginAttemptRepository,
                           EmailService emailService,
                           SmsService smsService,
                           JwtService jwtService,
                           WpSmsService wpSmsService) {
        this.userRepository = userRepository;
        this.otpVerificationRepository = otpVerificationRepository;
        this.mobileOtpVerificationRepository = mobileOtpVerificationRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.emailService = emailService;
        this.smsService = smsService;
        this.jwtService = jwtService;
        this.wpSmsService = wpSmsService;
    }

    @Override
    @Transactional
    public SendOtpResponse sendOtp(SendOtpRequest request, String ipAddress) {
        // If mobile number is provided
        if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()) {
            return sendMobileOtpInternal(request.getMobileNumber(), ipAddress);
        }
        // Fallback to email
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            return sendEmailOtpInternal(request.getEmail(), ipAddress);
        }
        throw new IllegalArgumentException("Either mobile number or email address is required.");
    }

    private SendOtpResponse sendMobileOtpInternal(String rawMobile, String ipAddress) {
        String normalizedMobile = normalizeMobileNumber(rawMobile);
        if (!INDIAN_MOBILE_PATTERN.matcher(normalizedMobile).matches()) {
            throw new IllegalArgumentException("செல்லுபடியாகும் கைபேசி எண்ணை உள்ளிடவும். / Invalid Indian mobile number.");
        }

        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);

        // IP-based abuse protection
        long ipAttempts = loginAttemptRepository.countByIpAddressAndAttemptTimeAfter(ipAddress, fifteenMinutesAgo);
        if (ipAttempts >= 15) {
            recordAttempt(normalizedMobile, ipAddress, false, "IP rate limit exceeded");
            throw new IllegalStateException("பல முறை முயற்சிக்கப்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும். / Too many requests from this IP. Please try again later.");
        }

        // Mobile-number-based abuse protection
        long mobileAttempts = loginAttemptRepository.countByEmailAndAttemptTimeAfter(normalizedMobile, fifteenMinutesAgo);
        if (mobileAttempts >= 5) {
            recordAttempt(normalizedMobile, ipAddress, false, "Mobile rate limit exceeded");
            throw new IllegalStateException("இந்த எண்ணிற்கு பல முறை முயற்சிக்கப்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும். / Too many requests for this mobile number. Please try again later.");
        }

        // Check cooldown
        Optional<MobileOtpVerification> latestOpt = mobileOtpVerificationRepository.findTopByMobileNumberOrderByCreatedAtDesc(normalizedMobile);
        if (latestOpt.isPresent()) {
            MobileOtpVerification latest = latestOpt.get();
            if (latest.getLastResendAt() != null && latest.getLastResendAt().plusSeconds(COOLDOWN_SECONDS).isAfter(LocalDateTime.now())) {
                long secondsRemaining = java.time.Duration.between(LocalDateTime.now(), latest.getLastResendAt().plusSeconds(COOLDOWN_SECONDS)).getSeconds();
                throw new IllegalStateException("Resend OTP cooldown active. Please wait " + Math.max(1, secondsRemaining) + " seconds before requesting a new OTP.");
            }
        }

        // Invalidate previous OTPs for this mobile number
        List<MobileOtpVerification> existingOtps = mobileOtpVerificationRepository.findAllByMobileNumber(normalizedMobile);
        for (MobileOtpVerification oldOtp : existingOtps) {
            oldOtp.setVerified(true);
        }
        mobileOtpVerificationRepository.saveAll(existingOtps);

        // Generate 6-digit OTP code and hash it
        int otpInt = 100000 + secureRandom.nextInt(900000);
        String rawOtp = String.valueOf(otpInt);
        String hashedOtp = hashTargetOtp(rawOtp, normalizedMobile);

        // Generate stable verification tracking ID
        String verificationId = "ver_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);

        // Dispatch SMS via WP-SMS Service Gateway
        boolean smsSent = wpSmsService.sendOtp(verificationId, normalizedMobile, rawOtp);
        if (!smsSent) {
            log.warn("WP-SMS Gateway failed to dispatch SMS for {}", normalizedMobile);
            recordAttempt(normalizedMobile, ipAddress, false, "WP-SMS Gateway request failed");
            throw new RuntimeException("OTP அனுப்ப முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும். / WP-SMS Gateway unavailable.");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(EXPIRATION_MINUTES);

        MobileOtpVerification newOtp = new MobileOtpVerification(normalizedMobile, hashedOtp, expiresAt);
        newOtp.setLastResendAt(now);
        newOtp.setResendCount(latestOpt.map(o -> o.getResendCount() + 1).orElse(1));
        mobileOtpVerificationRepository.save(newOtp);

        recordAttempt(normalizedMobile, ipAddress, true, "OTP Sent successfully via WP-SMS Gateway");
        return new SendOtpResponse(true, "OTP sent successfully", verificationId);
    }

    private SendOtpResponse sendEmailOtpInternal(String rawEmail, String ipAddress) {
        String email = rawEmail.trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format. Please provide a valid email address.");
        }

        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);

        // IP-based abuse protection
        long ipAttempts = loginAttemptRepository.countByIpAddressAndAttemptTimeAfter(ipAddress, fifteenMinutesAgo);
        if (ipAttempts >= 15) {
            recordAttempt(email, ipAddress, false, "IP rate limit exceeded");
            throw new IllegalStateException("பல முறை முயற்சிக்கப்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும். / Too many requests from this IP. Please try again later.");
        }

        // Email-based abuse protection
        long emailAttempts = loginAttemptRepository.countByEmailAndAttemptTimeAfter(email, fifteenMinutesAgo);
        if (emailAttempts >= 5) {
            recordAttempt(email, ipAddress, false, "Email rate limit exceeded");
            throw new IllegalStateException("இந்த மின்னஞ்சலுக்கு பல முறை முயற்சிக்கப்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும். / Too many requests for this email address. Please try again later.");
        }

        Optional<OtpVerification> latestOpt = otpVerificationRepository.findTopByEmailOrderByCreatedAtDesc(email);
        if (latestOpt.isPresent()) {
            OtpVerification latest = latestOpt.get();
            if (latest.getLastResendAt() != null && latest.getLastResendAt().plusSeconds(COOLDOWN_SECONDS).isAfter(LocalDateTime.now())) {
                long secondsRemaining = java.time.Duration.between(LocalDateTime.now(), latest.getLastResendAt().plusSeconds(COOLDOWN_SECONDS)).getSeconds();
                throw new IllegalStateException("Resend OTP cooldown active. Please wait " + Math.max(1, secondsRemaining) + " seconds before requesting a new OTP.");
            }
        }

        List<OtpVerification> existingOtps = otpVerificationRepository.findAllByEmail(email);
        for (OtpVerification oldOtp : existingOtps) {
            oldOtp.setVerified(true);
        }
        otpVerificationRepository.saveAll(existingOtps);

        int otpInt = 100000 + secureRandom.nextInt(900000);
        String rawOtp = String.valueOf(otpInt);
        String hashedOtp = hashTargetOtp(rawOtp, email);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(EXPIRATION_MINUTES);

        OtpVerification newOtpRecord = new OtpVerification();
        newOtpRecord.setEmail(email);
        newOtpRecord.setHashedOtp(hashedOtp);
        newOtpRecord.setExpiresAt(expiresAt);
        newOtpRecord.setAttempts(0);
        newOtpRecord.setVerified(false);
        newOtpRecord.setLastResendAt(now);
        newOtpRecord.setResendCount(latestOpt.map(o -> o.getResendCount() + 1).orElse(1));
        otpVerificationRepository.save(newOtpRecord);

        try {
            emailService.sendOtpEmail(email, rawOtp);
        } catch (Exception e) {
            log.error("Failed to send OTP email: {}", e.getMessage());
            throw new RuntimeException("OTP அனுப்ப முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.", e);
        }

        recordAttempt(email, ipAddress, true, "OTP Sent successfully to email");
        return new SendOtpResponse(true, "OTP sent successfully to email");
    }

    @Override
    @Transactional
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request, String ipAddress) {
        if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()) {
            return verifyMobileOtpInternal(request.getMobileNumber(), request.getVerificationId(), request.getOtp(), ipAddress);
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            return verifyEmailOtpInternal(request.getEmail(), request.getOtp(), ipAddress);
        }
        return new VerifyOtpResponse(false, null, null, false, "Either mobile number or email is required.");
    }

    private VerifyOtpResponse verifyMobileOtpInternal(String rawMobile, String verificationId, String submittedOtp, String ipAddress) {
        String normalizedMobile = normalizeMobileNumber(rawMobile);
        if (!INDIAN_MOBILE_PATTERN.matcher(normalizedMobile).matches()) {
            return new VerifyOtpResponse(false, null, null, false, "Invalid Indian mobile number format.");
        }

        Optional<MobileOtpVerification> otpOpt = mobileOtpVerificationRepository.findTopByMobileNumberOrderByCreatedAtDesc(normalizedMobile);
        if (otpOpt.isEmpty() || otpOpt.get().isVerified()) {
            recordAttempt(normalizedMobile, ipAddress, false, "No active OTP request found");
            return new VerifyOtpResponse(false, null, null, false, "OTP தவறாக உள்ளது. மீண்டும் முயற்சிக்கவும்.");
        }

        MobileOtpVerification otpRecord = otpOpt.get();

        if (otpRecord.getAttempts() >= MAX_ATTEMPTS) {
            recordAttempt(normalizedMobile, ipAddress, false, "Max attempts reached");
            return new VerifyOtpResponse(false, null, null, false, "பல முறை முயற்சிக்கப்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும்.");
        }

        if (LocalDateTime.now().isAfter(otpRecord.getExpiresAt())) {
            recordAttempt(normalizedMobile, ipAddress, false, "OTP expired");
            return new VerifyOtpResponse(false, null, null, false, "OTP காலாவதியாகிவிட்டது. புதிய OTP பெறவும்.");
        }

        String expectedHash = hashTargetOtp(submittedOtp, normalizedMobile);
        boolean isValid = expectedHash.equals(otpRecord.getHashedOtp());
        if (!isValid) {
            otpRecord.setAttempts(otpRecord.getAttempts() + 1);
            mobileOtpVerificationRepository.save(otpRecord);
            recordAttempt(normalizedMobile, ipAddress, false, "Invalid OTP code");

            if (otpRecord.getAttempts() >= MAX_ATTEMPTS) {
                return new VerifyOtpResponse(false, null, null, false, "பல முறை முயற்சிக்கப்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும்.");
            }
            return new VerifyOtpResponse(false, null, null, false, "OTP தவறாக உள்ளது. மீண்டும் முயற்சிக்கவும்.");
        }

        otpRecord.setVerified(true);
        mobileOtpVerificationRepository.save(otpRecord);

        // Find or create User
        Optional<User> userOpt = userRepository.findByMobileNumber(normalizedMobile);
        boolean isNewUser = false;
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (user.getName() == null || user.getName().isBlank() || user.getName().startsWith("Farmer ") || user.getDistrict() == null || user.getDistrict().isBlank()) {
                isNewUser = true;
            }
            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
        } else {
            isNewUser = true;
            user = new User();
            user.setMobileNumber(normalizedMobile);
            user.setRole("FARMER");
            user.setName("Farmer " + normalizedMobile.substring(7));
            user.setState("Tamil Nadu");
            user.setPreferredLanguage("Tamil");
            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getId(), user.getMobileNumber() != null ? user.getMobileNumber() : user.getEmail(), user.getRole());
        recordAttempt(normalizedMobile, ipAddress, true, "Success");

        UserDto userDto = mapToUserDto(user);
        return new VerifyOtpResponse(true, token, userDto, isNewUser, "OTP verification successful.");
    }

    private VerifyOtpResponse verifyEmailOtpInternal(String rawEmail, String submittedOtp, String ipAddress) {
        String email = rawEmail.trim().toLowerCase();
        Optional<OtpVerification> otpOpt = otpVerificationRepository.findTopByEmailOrderByCreatedAtDesc(email);
        if (otpOpt.isEmpty() || otpOpt.get().isVerified()) {
            recordAttempt(email, ipAddress, false, "No active OTP request found");
            return new VerifyOtpResponse(false, null, null, false, "OTP தவறாக உள்ளது. மீண்டும் முயற்சிக்கவும்.");
        }

        OtpVerification otpRecord = otpOpt.get();

        if (otpRecord.getAttempts() >= MAX_ATTEMPTS) {
            recordAttempt(email, ipAddress, false, "Max attempts reached");
            return new VerifyOtpResponse(false, null, null, false, "பல முறை முயற்சிக்கப்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும்.");
        }

        if (LocalDateTime.now().isAfter(otpRecord.getExpiresAt())) {
            recordAttempt(email, ipAddress, false, "OTP expired");
            return new VerifyOtpResponse(false, null, null, false, "OTP காலாவதியாகிவிட்டது. புதிய OTP பெறவும்.");
        }

        String hashedSubmitted = hashTargetOtp(submittedOtp, email);
        if (!hashedSubmitted.equals(otpRecord.getHashedOtp())) {
            otpRecord.setAttempts(otpRecord.getAttempts() + 1);
            otpVerificationRepository.save(otpRecord);
            recordAttempt(email, ipAddress, false, "Invalid OTP code");

            if (otpRecord.getAttempts() >= MAX_ATTEMPTS) {
                return new VerifyOtpResponse(false, null, null, false, "பல முறை முயற்சிக்கப்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும்.");
            }
            return new VerifyOtpResponse(false, null, null, false, "OTP தவறாக உள்ளது. மீண்டும் முயற்சிக்கவும்.");
        }

        otpRecord.setVerified(true);
        otpVerificationRepository.save(otpRecord);

        Optional<User> userOpt = userRepository.findByEmail(email);
        boolean isNewUser = false;
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
        } else {
            isNewUser = true;
            String defaultUsername = email.split("@")[0];
            user = new User();
            user.setEmail(email);
            user.setUsername(defaultUsername);
            user.setRole("FARMER");
            user.setName("Farmer " + defaultUsername);
            user.setState("Tamil Nadu");
            user.setPreferredLanguage("Tamil");
            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        recordAttempt(email, ipAddress, true, "Success");

        UserDto userDto = mapToUserDto(user);
        return new VerifyOtpResponse(true, token, userDto, isNewUser, "OTP verification successful.");
    }

    @Override
    @Transactional
    public UserDto saveProfile(UserProfileDto profileDto) {
        User user = null;
        if (profileDto.getMobileNumber() != null && !profileDto.getMobileNumber().isBlank()) {
            String norm = normalizeMobileNumber(profileDto.getMobileNumber());
            user = userRepository.findByMobileNumber(norm).orElse(null);
        }
        if (user == null && profileDto.getEmail() != null && !profileDto.getEmail().isBlank()) {
            user = userRepository.findByEmail(profileDto.getEmail().trim().toLowerCase()).orElse(null);
        }
        if (user == null) {
            throw new IllegalArgumentException("Farmer profile record not found.");
        }

        user.setName(profileDto.getName());
        if (profileDto.getMobileNumber() != null && !profileDto.getMobileNumber().isBlank()) {
            user.setMobileNumber(normalizeMobileNumber(profileDto.getMobileNumber()));
        }
        if (profileDto.getEmail() != null && !profileDto.getEmail().isBlank()) {
            user.setEmail(profileDto.getEmail().trim().toLowerCase());
        }
        if (profileDto.getState() != null) user.setState(profileDto.getState());
        if (profileDto.getDistrict() != null) user.setDistrict(profileDto.getDistrict());
        if (profileDto.getTaluk() != null) user.setTaluk(profileDto.getTaluk());
        if (profileDto.getVillage() != null) user.setVillage(profileDto.getVillage());
        if (profileDto.getPreferredLanguage() != null) user.setPreferredLanguage(profileDto.getPreferredLanguage());

        user = userRepository.save(user);
        return mapToUserDto(user);
    }

    @Override
    public UserDto getCurrentUser(String identifier) {
        if (identifier == null) return null;
        if (identifier.startsWith("+") || identifier.matches("^\\d{10}$")) {
            String norm = normalizeMobileNumber(identifier);
            return userRepository.findByMobileNumber(norm).map(this::mapToUserDto).orElse(null);
        }
        return userRepository.findByEmail(identifier.toLowerCase().trim()).map(this::mapToUserDto).orElse(null);
    }

    @Override
    public void logout(String identifier) {
        log.info("Logged out user: {}", identifier);
    }

    private String normalizeMobileNumber(String raw) {
        if (raw == null) return "";
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.length() == 10 && digits.matches("^[6-9]\\d{9}$")) {
            return "+91" + digits;
        }
        if (digits.length() == 12 && digits.startsWith("91") && digits.substring(2).matches("^[6-9]\\d{9}$")) {
            return "+" + digits;
        }
        if (raw.trim().startsWith("+91") && digits.length() == 12) {
            return "+91" + digits.substring(2);
        }
        return raw.trim();
    }

    private void recordAttempt(String target, String ipAddress, boolean success, String reason) {
        try {
            LoginAttempt attempt = new LoginAttempt(target, ipAddress, success, reason);
            loginAttemptRepository.save(attempt);
        } catch (Exception e) {
            log.warn("Failed to record login attempt: {}", e.getMessage());
        }
    }

    private String hashTargetOtp(String otp, String target) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String salt = "TN_FARMER_PORTAL_SALT_" + target.toLowerCase().trim();
            byte[] hash = digest.digest((salt + ":" + otp).getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating cryptographic hash for OTP", e);
        }
    }

    private UserDto mapToUserDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getName(),
                user.getMobileNumber(),
                user.getState(),
                user.getDistrict(),
                user.getTaluk(),
                user.getVillage(),
                user.getPreferredLanguage()
        );
    }
}
