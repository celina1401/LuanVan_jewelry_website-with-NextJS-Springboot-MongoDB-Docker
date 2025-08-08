package com.b2110941.NotificationService.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "spring.mail.host")
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendNotificationEmail(String to, String subject, String message) {
        try {
            if (mailSender == null) {
                log.warn("JavaMailSender is not available, skipping email notification");
                return;
            }
            
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            mailMessage.setFrom("noreply@yourcompany.com");

            mailSender.send(mailMessage);
            log.info("Email notification sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email notification to: {}, error: {}", to, e.getMessage(), e);
        }
    }
}
