package com.farmersportal.service;

import com.farmersportal.dto.FarmerProfileDTO;

public interface FarmerProfileService {
    FarmerProfileDTO getFarmerProfile(String farmerId);
    FarmerProfileDTO createOrUpdateFarmerProfile(FarmerProfileDTO dto);
}
