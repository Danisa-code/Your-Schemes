package com.farmersportal.repository;

import com.farmersportal.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    List<LoginAttempt> findByEmailAndAttemptTimeAfter(String email, LocalDateTime since);
    long countByEmailAndSuccessFalseAndAttemptTimeAfter(String email, LocalDateTime since);
    long countByIpAddressAndAttemptTimeAfter(String ipAddress, LocalDateTime since);
    long countByEmailAndAttemptTimeAfter(String email, LocalDateTime since);
}
