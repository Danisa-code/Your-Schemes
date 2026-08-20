package com.farmersportal.controller;

import com.farmersportal.dto.*;
import com.farmersportal.service.AuthService;
import com.farmersportal.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody SendOtpRequest request, HttpServletRequest servletRequest) {
        String clientIp = getClientIp(servletRequest);
        log.info("API Request: POST /api/auth/send-otp from IP {}", clientIp);

        try {
            SendOtpResponse response = authService.sendOtp(request, clientIp);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request, HttpServletRequest servletRequest) {
        String clientIp = getClientIp(servletRequest);
        log.info("API Request: POST /api/auth/verify-otp from IP {}", clientIp);

        VerifyOtpResponse response = authService.verifyOtp(request, clientIp);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/profile")
    public ResponseEntity<?> saveProfile(@Valid @RequestBody UserProfileDto profileDto,
                                         @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("API Request: POST /api/auth/profile");

        try {
            UserDto updatedUser = authService.saveProfile(profileDto);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile saved successfully",
                    "user", updatedUser
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("API Request: POST /api/auth/logout");
        if (authHeader != null && jwtService.validateToken(authHeader)) {
            String identifier = jwtService.getEmailFromToken(authHeader);
            if (identifier != null) {
                authService.logout(identifier);
            }
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !jwtService.validateToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Unauthorized token"));
        }
        String identifier = jwtService.getEmailFromToken(authHeader);
        UserDto user = authService.getCurrentUser(identifier);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "User profile not found"));
        }
        return ResponseEntity.ok(Map.of("success", true, "user", user));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
