package com.farmersportal.repository;

import com.farmersportal.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByEmailOrderByCreatedAtDesc(String email);
    List<OtpVerification> findAllByEmail(String email);
    void deleteAllByEmail(String email);
}
