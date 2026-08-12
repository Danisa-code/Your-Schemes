package com.farmersportal.repository;

import com.farmersportal.entity.FarmerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FarmerProfileRepository extends JpaRepository<FarmerProfile, Long> {
    Optional<FarmerProfile> findByFarmerId(String farmerId);
}
