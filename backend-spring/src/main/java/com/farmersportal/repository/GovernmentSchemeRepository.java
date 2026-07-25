package com.farmersportal.repository;

import com.farmersportal.entity.GovernmentScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GovernmentSchemeRepository extends JpaRepository<GovernmentScheme, Long> {
    List<GovernmentScheme> findByCategory(String category);
    List<GovernmentScheme> findByState(String state);
}
