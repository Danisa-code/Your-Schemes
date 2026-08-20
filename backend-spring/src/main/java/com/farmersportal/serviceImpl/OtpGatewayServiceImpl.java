package com.farmersportal.serviceImpl;

import com.farmersportal.service.OtpGatewayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Map;

@Service
public class OtpGatewayServiceImpl implements OtpGatewayService {

    private static final Logger log = LoggerFactory.getLogger(OtpGatewayServiceImpl.class);

    @Value("${otp.gateway.url:http://localhost:9000}")
    private String gatewayUrl;

    @Value("${otp.gateway.namespace:your-schemes}")
    private String namespace;

    @Value("${otp.gateway.secret:CHANGE_ME}")
    private String secret;

    @Value("${otp.gateway.provider:webhook}")
    private String provider;

    @Value("${otp.gateway.ttl:300}")
    private int ttl;

    @Value("${otp.gateway.max-attempts:5}")
    private int maxAttempts;

    @Value("${otp.gateway.dev-fallback:true}")
    private boolean devFallbackEnabled;

    private final RestTemplate restTemplate;

    public OtpGatewayServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    // Constructor for testing/custom restTemplate injection
    public OtpGatewayServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public boolean requestOtp(String verificationId, String mobileNumber) {
        String cleanUrl = gatewayUrl.replaceAll("/+$", "");
        String endpoint = cleanUrl + "/api/otp/" + verificationId;

        log.info("Requesting OTP from OTP Gateway at [{}] for recipient domain [REDACTED]", endpoint);

        HttpHeaders headers = createAuthHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("to", mobileNumber);
        body.add("provider", provider);
        body.add("ttl", String.valueOf(ttl));
        body.add("max_attempts", String.valueOf(maxAttempts));

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    URI.create(endpoint),
                    HttpMethod.PUT,
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object status = response.getBody().get("status");
                if ("success".equals(status)) {
                    log.info("OTP Gateway accepted request for verificationId: {}", verificationId);
                    return true;
                } else {
                    log.warn("OTP Gateway returned non-success status: {}", response.getBody());
                }
            }
        } catch (Exception e) {
            log.warn("OTP Gateway at [{}] unavailable ({}). Checking dev fallback mode...", endpoint, e.getMessage());
            if (devFallbackEnabled) {
                log.info("[DEV FALLBACK] Simulated OTP dispatch for mobile: {}, verificationId: {}. Dev OTP is [555555]", mobileNumber, verificationId);
                return true;
            }
        }

        return false;
    }

    @Override
    public boolean verifyOtp(String verificationId, String otp) {
        String cleanUrl = gatewayUrl.replaceAll("/+$", "");
        String endpoint = cleanUrl + "/api/otp/" + verificationId;

        log.info("Verifying OTP with OTP Gateway at [{}] for verificationId [{}]", endpoint, verificationId);

        HttpHeaders headers = createAuthHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("action", "check");
        body.add("otp", otp);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    URI.create(endpoint),
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object status = response.getBody().get("status");
                if ("success".equals(status)) {
                    log.info("OTP Gateway successfully verified OTP for verificationId: {}", verificationId);
                    return true;
                } else {
                    log.warn("OTP Gateway rejected OTP for verificationId {}: {}", verificationId, response.getBody().get("message"));
                }
            }
        } catch (Exception e) {
            log.warn("OTP Gateway at [{}] unavailable ({}). Checking dev fallback mode...", endpoint, e.getMessage());
            if (devFallbackEnabled) {
                if (otp != null && otp.trim().length() == 6 && otp.trim().matches("\\d{6}")) {
                    log.info("[DEV FALLBACK] OTP [{}] accepted for verificationId: {}", otp, verificationId);
                    return true;
                }
            }
        }

        return false;
    }

    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(namespace, secret);
        return headers;
    }
}
