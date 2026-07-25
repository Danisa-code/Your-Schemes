package com.farmersportal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "farmer_profiles")
public class FarmerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false, unique = true)
    private String farmerId;

    @Column(name = "farmer_name", nullable = false)
    private String farmerName;

    @Column(name = "land_size")
    private Double landSize;

    @Column(name = "active_subsidies")
    private Integer activeSubsidies;

    @Column(name = "district_location")
    private String districtLocation;

    @Column(name = "aadhaar_status")
    private String aadhaarStatus;

    @Column(name = "soil_health_rating")
    private String soilHealthRating;

    public FarmerProfile() {}

    public FarmerProfile(Long id, String farmerId, String farmerName, Double landSize, Integer activeSubsidies, String districtLocation, String aadhaarStatus, String soilHealthRating) {
        this.id = id;
        this.farmerId = farmerId;
        this.farmerName = farmerName;
        this.landSize = landSize;
        this.activeSubsidies = activeSubsidies;
        this.districtLocation = districtLocation;
        this.aadhaarStatus = aadhaarStatus;
        this.soilHealthRating = soilHealthRating;
    }

    public static FarmerProfileBuilder builder() {
        return new FarmerProfileBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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

    public static class FarmerProfileBuilder {
        private Long id;
        private String farmerId;
        private String farmerName;
        private Double landSize;
        private Integer activeSubsidies;
        private String districtLocation;
        private String aadhaarStatus;
        private String soilHealthRating;

        FarmerProfileBuilder() {}

        public FarmerProfileBuilder id(Long id) { this.id = id; return this; }
        public FarmerProfileBuilder farmerId(String farmerId) { this.farmerId = farmerId; return this; }
        public FarmerProfileBuilder farmerName(String farmerName) { this.farmerName = farmerName; return this; }
        public FarmerProfileBuilder landSize(Double landSize) { this.landSize = landSize; return this; }
        public FarmerProfileBuilder activeSubsidies(Integer activeSubsidies) { this.activeSubsidies = activeSubsidies; return this; }
        public FarmerProfileBuilder districtLocation(String districtLocation) { this.districtLocation = districtLocation; return this; }
        public FarmerProfileBuilder aadhaarStatus(String aadhaarStatus) { this.aadhaarStatus = aadhaarStatus; return this; }
        public FarmerProfileBuilder soilHealthRating(String soilHealthRating) { this.soilHealthRating = soilHealthRating; return this; }

        public FarmerProfile build() {
            return new FarmerProfile(id, farmerId, farmerName, landSize, activeSubsidies, districtLocation, aadhaarStatus, soilHealthRating);
        }
    }
}
