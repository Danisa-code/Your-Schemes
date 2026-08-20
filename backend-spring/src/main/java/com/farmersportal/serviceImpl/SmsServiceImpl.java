package com.farmersportal.serviceImpl;

import com.farmersportal.service.SmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class SmsServiceImpl implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsServiceImpl.class);

    @Value("${sms.provider:MOCK}")
    private String smsProvider;

    @Value("${sms.api-key:}")
    private String apiKey;

    @Value("${sms.auth-key:}")
    private String authKey;

    @Value("${sms.sender-id:TNFARM}")
    private String senderId;

    @Value("${sms.template-id:}")
    private String templateId;

    private final RestTemplate restTemplate;

    public SmsServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public void sendSms(String mobileNumber, String otp, String formattedMessage) throws Exception {
        String provider = smsProvider != null ? smsProvider.trim().toUpperCase() : "MOCK";
        log.info("Dispatching SMS OTP using Provider: [{}] to recipient domain [REDACTED]", provider);

        switch (provider) {
            case "MSG91":
                sendViaMsg91(mobileNumber, otp, formattedMessage);
                break;
            case "2FACTOR":
            case "TWOFACTOR":
                sendVia2Factor(mobileNumber, otp, formattedMessage);
                break;
            case "MOCK":
            default:
                log.info("[SMS MOCK SERVICE] Provider: MOCK | Mobile: [REDACTED] | Message: {}", formattedMessage);
                break;
        }
    }

    private void sendViaMsg91(String mobileNumber, String otp, String message) throws Exception {
        if (authKey == null || authKey.isBlank()) {
            log.warn("MSG91 auth key missing. Falling back to local logging mode.");
            log.info("[MSG91 MOCK] Message: {}", message);
            return;
        }

        // MSG91 API v5
        String cleanNumber = mobileNumber.replace("+", "");
        String url = "https://api.msg91.com/api/v5/otp?template_id=" + URLEncoder.encode(templateId, StandardCharsets.UTF_8)
                + "&mobile=" + URLEncoder.encode(cleanNumber, StandardCharsets.UTF_8)
                + "&otp=" + URLEncoder.encode(otp, StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.set("authkey", authKey);
        headers.set("Content-Type", "application/json");

        HttpEntity<String> entity = new HttpEntity<>("{}", headers);
        ResponseEntity<String> response = restTemplate.exchange(URI.create(url), HttpMethod.POST, entity, String.class);

        log.info("MSG91 API response status: {}", response.getStatusCode());
    }

    private void sendVia2Factor(String mobileNumber, String otp, String message) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("2Factor API key missing. Falling back to local logging mode.");
            log.info("[2Factor MOCK] Message: {}", message);
            return;
        }

        String cleanNumber = mobileNumber.replace("+", "");
        String url = "https://2factor.in/API/V1/" + apiKey + "/SMS/" + cleanNumber + "/" + otp;
        if (templateId != null && !templateId.isBlank()) {
            url += "/" + URLEncoder.encode(templateId, StandardCharsets.UTF_8);
        }

        ResponseEntity<String> response = restTemplate.getForEntity(URI.create(url), String.class);
        log.info("2Factor API response status: {}", response.getStatusCode());
    }
}

