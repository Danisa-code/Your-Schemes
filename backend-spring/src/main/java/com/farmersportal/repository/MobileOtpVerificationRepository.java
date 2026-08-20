package com.farmersportal.repository;

import com.farmersportal.entity.MobileOtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface MobileOtpVerificationRepository extends JpaRepository<MobileOtpVerification, Long> {
    Optional<MobileOtpVerification> findTopByMobileNumberOrderByCreatedAtDesc(String mobileNumber);
    List<MobileOtpVerification> findAllByMobileNumber(String mobileNumber);
    void deleteAllByMobileNumber(String mobileNumber);
}
