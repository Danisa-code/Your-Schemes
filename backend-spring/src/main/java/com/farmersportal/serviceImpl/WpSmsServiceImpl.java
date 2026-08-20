package com.farmersportal.serviceImpl;

import com.farmersportal.service.WpSmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.*;

/**
 * TextBee SMS Gateway integration.
 * Uses your Android phone as the SMS gateway via the textbee.dev REST API.
 *
 * Setup steps:
 *   1. Register at https://app.textbee.dev/register (free tier available)
 *   2. Install the TextBee Android app on your phone
 *   3. Register your device from the dashboard
 *   4. Generate an API key from the dashboard
 *   5. Set TEXTBEE_API_KEY environment variable (or in application.properties)
 *
 * API Reference: https://textbee.dev/docs/sending-sms/sending-sms
 */
@Service
public class WpSmsServiceImpl implements WpSmsService {

    private static final Logger log = LoggerFactory.getLogger(WpSmsServiceImpl.class);

    private static final String TEXTBEE_API_URL = "https://api.textbee.dev/api/v1/gateway/send-sms";

    @Value("${textbee.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public WpSmsServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    public WpSmsServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public boolean sendOtp(String verificationId, String mobileNumber, String otpCode) {
        log.info("Preparing TextBee SMS dispatch for recipient [{}] with verificationId [{}]", mobileNumber, verificationId);

        if (apiKey == null || apiKey.isBlank()) {
            log.error("TextBee API key is not configured! Set TEXTBEE_API_KEY in application.properties or environment variable.");
            return false;
        }

        String messageText = String.format(
                "Your-Schemes OTP: %s. Valid for 5 minutes. Do not share this code.",
                otpCode
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);

        Map<String, Object> payload = new HashMap<>();
        payload.put("recipients", Collections.singletonList(mobileNumber));
        payload.put("message", messageText);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    URI.create(TEXTBEE_API_URL),
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("TextBee SMS dispatched successfully for mobile: {}, verificationId: {}", mobileNumber, verificationId);
                return true;
            } else {
                log.warn("TextBee API returned non-2xx status: {} for mobile: {}", response.getStatusCode(), mobileNumber);
                return false;
            }
        } catch (Exception e) {
            log.error("TextBee SMS dispatch failed for mobile [{}]: {}", mobileNumber, e.getMessage());
            return false;
        }
    }
}
