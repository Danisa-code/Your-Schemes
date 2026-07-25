package com.farmersportal.serviceImpl;

import com.farmersportal.dto.FarmerProfileDTO;
import com.farmersportal.entity.FarmerProfile;
import com.farmersportal.repository.FarmerProfileRepository;
import com.farmersportal.service.FarmerProfileService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@SuppressWarnings("null")
public class FarmerProfileServiceImpl implements FarmerProfileService {

    private static final Logger log = LoggerFactory.getLogger(FarmerProfileServiceImpl.class);

    private final FarmerProfileRepository farmerProfileRepository;

    // Constructor Injection
    public FarmerProfileServiceImpl(FarmerProfileRepository farmerProfileRepository) {
        this.farmerProfileRepository = farmerProfileRepository;
    }

    @PostConstruct
    public void initSeedProfile() {
        // Pre-seed default farmer profile if empty
        if (farmerProfileRepository.findByFarmerId("KS-GPS-99283").isEmpty()) {
            log.info("Pre-seeding database with default farmer profile for Patel Rajeshbhai...");
            FarmerProfile profile = FarmerProfile.builder()
                    .farmerId("KS-GPS-99283")
                    .farmerName("Patel Rajeshbhai")
                    .landSize(4.2)
                    .activeSubsidies(3)
                    .districtLocation("Nashik, Maharashtra")
                    .aadhaarStatus("Verified")
                    .soilHealthRating("Excellent (8.5/10)")
                    .build();
            farmerProfileRepository.save(profile);
            log.info("Farmer profile pre-seeded successfully.");
        }
    }

    @Override
    public FarmerProfileDTO getFarmerProfile(String farmerId) {
        log.info("Fetching farmer profile for ID: {}", farmerId);
        FarmerProfile profile = farmerProfileRepository.findByFarmerId(farmerId)
                .orElseGet(() -> farmerProfileRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No farmer profile found.")));

        return mapToDTO(profile);
    }

    @Override
    public FarmerProfileDTO createOrUpdateFarmerProfile(FarmerProfileDTO dto) {
        log.info("Updating farmer profile: id={}, name={}", dto.getFarmerId(), dto.getFarmerName());
        FarmerProfile profile = farmerProfileRepository.findByFarmerId(dto.getFarmerId())
                .orElseGet(() -> FarmerProfile.builder().farmerId(dto.getFarmerId()).build());

        profile.setFarmerName(dto.getFarmerName());
        profile.setLandSize(dto.getLandSize());
        profile.setActiveSubsidies(dto.getActiveSubsidies());
        profile.setDistrictLocation(dto.getDistrictLocation());
        profile.setAadhaarStatus(dto.getAadhaarStatus());
        profile.setSoilHealthRating(dto.getSoilHealthRating());

        FarmerProfile saved = farmerProfileRepository.save(profile);
        return mapToDTO(saved);
    }

    private FarmerProfileDTO mapToDTO(FarmerProfile entity) {
        return FarmerProfileDTO.builder()
                .farmerId(entity.getFarmerId())
                .farmerName(entity.getFarmerName())
                .landSize(entity.getLandSize())
                .activeSubsidies(entity.getActiveSubsidies())
                .districtLocation(entity.getDistrictLocation())
                .aadhaarStatus(entity.getAadhaarStatus())
                .soilHealthRating(entity.getSoilHealthRating())
                .build();
    }
}
