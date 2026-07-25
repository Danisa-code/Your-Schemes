package com.farmersportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tn_districts")
public class DistrictEntity {

    @Id
    @Column(name = "district_code", length = 10)
    private String districtCode;

    @Column(name = "district_name_en", nullable = false, unique = true, length = 100)
    private String districtNameEn;

    @Column(name = "district_name_ta", nullable = false, unique = true, length = 100)
    private String districtNameTa;

    @Column(name = "collector_office_address", nullable = false, columnDefinition = "TEXT")
    private String collectorOfficeAddress;

    @Column(name = "agriculture_office_address", nullable = false, columnDefinition = "TEXT")
    private String agricultureOfficeAddress;

    @ElementCollection
    @CollectionTable(name = "tn_district_crops", joinColumns = @JoinColumn(name = "district_code"))
    @Column(name = "crop_name")
    private List<String> majorCrops;

    @Column(name = "average_rainfall_mm", nullable = false)
    private Double averageRainfallMm;

    @ElementCollection
    @CollectionTable(name = "tn_district_soils", joinColumns = @JoinColumn(name = "district_code"))
    @Column(name = "soil_type")
    private List<String> soilTypes;

    @Column(name = "climate_zone", nullable = false, length = 150)
    private String climateZone;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public DistrictEntity() {}

    public DistrictEntity(String districtCode, String districtNameEn, String districtNameTa, String collectorOfficeAddress, String agricultureOfficeAddress, List<String> majorCrops, Double averageRainfallMm, List<String> soilTypes, String climateZone) {
        this.districtCode = districtCode;
        this.districtNameEn = districtNameEn;
        this.districtNameTa = districtNameTa;
        this.collectorOfficeAddress = collectorOfficeAddress;
        this.agricultureOfficeAddress = agricultureOfficeAddress;
        this.majorCrops = majorCrops;
        this.averageRainfallMm = averageRainfallMm;
        this.soilTypes = soilTypes;
        this.climateZone = climateZone;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Standard Getters and Setters
    public String getDistrictCode() { return districtCode; }
    public void setDistrictCode(String districtCode) { this.districtCode = districtCode; }

    public String getDistrictNameEn() { return districtNameEn; }
    public void setDistrictNameEn(String districtNameEn) { this.districtNameEn = districtNameEn; }

    public String getDistrictNameTa() { return districtNameTa; }
    public void setDistrictNameTa(String districtNameTa) { this.districtNameTa = districtNameTa; }

    public String getCollectorOfficeAddress() { return collectorOfficeAddress; }
    public void setCollectorOfficeAddress(String collectorOfficeAddress) { this.collectorOfficeAddress = collectorOfficeAddress; }

    public String getAgricultureOfficeAddress() { return agricultureOfficeAddress; }
    public void setAgricultureOfficeAddress(String agricultureOfficeAddress) { this.agricultureOfficeAddress = agricultureOfficeAddress; }

    public List<String> getMajorCrops() { return majorCrops; }
    public void setMajorCrops(List<String> majorCrops) { this.majorCrops = majorCrops; }

    public Double getAverageRainfallMm() { return averageRainfallMm; }
    public void setAverageRainfallMm(Double averageRainfallMm) { this.averageRainfallMm = averageRainfallMm; }

    public List<String> getSoilTypes() { return soilTypes; }
    public void setSoilTypes(List<String> soilTypes) { this.soilTypes = soilTypes; }

    public String getClimateZone() { return climateZone; }
    public void setClimateZone(String climateZone) { this.climateZone = climateZone; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
