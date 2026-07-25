package com.farmersportal.controller;

import com.farmersportal.dto.FarmerProfileDTO;
import com.farmersportal.service.FarmerProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class FarmerProfileController {

    private static final Logger log = LoggerFactory.getLogger(FarmerProfileController.class);

    private final FarmerProfileService farmerProfileService;

    // Constructor Injection
    public FarmerProfileController(FarmerProfileService farmerProfileService) {
        this.farmerProfileService = farmerProfileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<FarmerProfileDTO> getFarmerProfile(
            @RequestParam(value = "farmerId", defaultValue = "KS-GPS-99283") String farmerId) {
        
        log.info("API request: GET /api/profile farmerId={}", farmerId);
        FarmerProfileDTO profile = farmerProfileService.getFarmerProfile(farmerId);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/profile")
    public ResponseEntity<FarmerProfileDTO> updateFarmerProfile(@RequestBody FarmerProfileDTO profileDTO) {
        log.info("API request: POST /api/profile updating farmerId={}", profileDTO.getFarmerId());
        FarmerProfileDTO updated = farmerProfileService.createOrUpdateFarmerProfile(profileDTO);
        return ResponseEntity.ok(updated);
    }
}
