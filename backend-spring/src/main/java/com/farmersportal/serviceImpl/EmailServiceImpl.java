package com.farmersportal.serviceImpl;

import com.farmersportal.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${mail.from:no-reply@farmersportal.tn.gov.in}")
    private String mailFrom;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendOtpEmail(String toEmail, String otp) throws Exception {
        log.info("Preparing OTP email dispatch to target recipient: [REDACTED_EMAIL_DOMAIN]");

        String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                <style>
                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }
                  .container { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-top: 6px solid #16a34a; }
                  .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
                  .title { color: #15803d; font-size: 22px; font-weight: bold; margin: 10px 0 5px 0; }
                  .subtitle { color: #6b7280; font-size: 14px; margin: 0; }
                  .otp-box { background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 10px; text-align: center; padding: 20px; margin: 25px 0; }
                  .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #15803d; font-family: monospace; }
                  .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #92400e; margin-bottom: 20px; }
                  .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 25px; border-top: 1px solid #f3f4f6; padding-top: 15px; }
                </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h2 class="title">Tamil Nadu Farmer Assistance Portal</h2>
                      <p class="subtitle">தமிழ்நாடு விவசாயிகள் உதவி போர்ட்டல்</p>
                    </div>
                    <div style="margin-top: 20px; color: #374151; font-size: 15px; line-height: 1.6;">
                      <p>Dear Farmer / மதிப்பிற்குரிய விவசாயி,</p>
                      <p>Use the following 6-digit One-Time Password (OTP) to complete your login / verification:</p>
                    </div>
                    <div class="otp-box">
                      <div style="font-size: 12px; color: #166534; font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">Your Verification Code / உங்கள் OTP</div>
                      <div class="otp-code">%s</div>
                    </div>
                    <div class="warning">
                      <strong>Important / முக்கியம்:</strong><br/>
                      • Your OTP is: <strong>%s</strong><br/>
                      • OTP expires in 5 minutes.<br/>
                      • Do not share this OTP with anyone.
                    </div>
                    <p style="color: #4b5563; font-size: 13px;">If you did not request this OTP code, please ignore this email.</p>
                    <div class="footer">
                      © Department of Agriculture & Farmer Welfare, Government of Tamil Nadu.<br/>
                      This is an automated system email, please do not reply.
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(otp, otp);

        try {
            if (mailUsername == null || mailUsername.trim().isEmpty()) {
                log.warn("SMTP MAIL_USERNAME environment variable not set. Simulating mail dispatch in local fallback mode.");
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String fromAddress = (mailFrom != null && !mailFrom.isEmpty()) ? mailFrom : "no-reply@farmersportal.tn.gov.in";
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Your Farmer Assistance Portal OTP");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("OTP email successfully dispatched via JavaMailSender.");
        } catch (Exception e) {
            log.error("Failed to send OTP email via SMTP provider: {}", e.getMessage());
            if (mailUsername != null && !mailUsername.trim().isEmpty()) {
                throw new RuntimeException("OTP அனுப்ப முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.", e);
            }
        }
    }
}
