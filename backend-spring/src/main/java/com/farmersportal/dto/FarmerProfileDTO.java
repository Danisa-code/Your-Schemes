package com.farmersportal.dto;

public class FarmerProfileDTO {
    private String farmerId;
    private String farmerName;
    private Double landSize;
    private Integer activeSubsidies;
    private String districtLocation;
    private String aadhaarStatus;
    private String soilHealthRating;

    public FarmerProfileDTO() {}

    public FarmerProfileDTO(String farmerId, String farmerName, Double landSize, Integer activeSubsidies, String districtLocation, String aadhaarStatus, String soilHealthRating) {
        this.farmerId = farmerId;
        this.farmerName = farmerName;
        this.landSize = landSize;
        this.activeSubsidies = activeSubsidies;
        this.districtLocation = districtLocation;
        this.aadhaarStatus = aadhaarStatus;
        this.soilHealthRating = soilHealthRating;
    }

    public static FarmerProfileDTOBuilder builder() {
        return new FarmerProfileDTOBuilder();
    }

    // Getters and Setters
    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }
    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }
    public Double getLandSize() { return landSize; }
    public void setLandSize(Double landSize) { this.landSize = landSize; }
    public Integer getActiveSubsidies() { return activeSubsidies; }
    public void setActiveSubsidies(Integer activeSubsidies) { this.activeSubsidies = activeSubsidies; }
    public String getDistrictLocation() { return districtLocation; }
    public void setDistrictLocation(String districtLocation) { this.districtLocation = districtLocation; }
    public String getAadhaarStatus() { return aadhaarStatus; }
    public void setAadhaarStatus(String aadhaarStatus) { this.aadhaarStatus = aadhaarStatus; }
    public String getSoilHealthRating() { return soilHealthRating; }
    public void setSoilHealthRating(String soilHealthRating) { this.soilHealthRating = soilHealthRating; }

    public static class FarmerProfileDTOBuilder {
        private String farmerId;
        private String farmerName;
        private Double landSize;
        private Integer activeSubsidies;
        private String districtLocation;
        private String aadhaarStatus;
        private String soilHealthRating;

        FarmerProfileDTOBuilder() {}

        public FarmerProfileDTOBuilder farmerId(String farmerId) { this.farmerId = farmerId; return this; }
        public FarmerProfileDTOBuilder farmerName(String farmerName) { this.farmerName = farmerName; return this; }
        public FarmerProfileDTOBuilder landSize(Double landSize) { this.landSize = landSize; return this; }
        public FarmerProfileDTOBuilder activeSubsidies(Integer activeSubsidies) { this.activeSubsidies = activeSubsidies; return this; }
        public FarmerProfileDTOBuilder districtLocation(String districtLocation) { this.districtLocation = districtLocation; return this; }
        public FarmerProfileDTOBuilder aadhaarStatus(String aadhaarStatus) { this.aadhaarStatus = aadhaarStatus; return this; }
        public FarmerProfileDTOBuilder soilHealthRating(String soilHealthRating) { this.soilHealthRating = soilHealthRating; return this; }

        public FarmerProfileDTO build() {
            return new FarmerProfileDTO(farmerId, farmerName, landSize, activeSubsidies, districtLocation, aadhaarStatus, soilHealthRating);
        }
    }
}
