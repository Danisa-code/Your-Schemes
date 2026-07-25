package com.your;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "tn_markets", indexes = {
    @Index(name = "idx_tn_markets_district", columnList = "district_en"),
    @Index(name = "idx_tn_markets_category", columnList = "market_category")
})
public class MarketEntity {

    @Id
    @Column(name = "unique_market_id", length = 20)
    private String uniqueMarketId;

    @Column(name = "official_market_code", nullable = false, unique = true, length = 30)
    private String officialMarketCode;

    @Column(name = "official_market_name_en", nullable = false, length = 150)
    private String officialMarketNameEn;

    @Column(name = "official_market_name_ta", nullable = false, length = 150)
    private String officialMarketNameTa;

    @Column(name = "common_name", nullable = false, length = 150)
    private String commonName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_en", referencedColumnName = "district_name_en", nullable = false)
    private DistrictEntity district;

    @Column(name = "district_ta", nullable = false, length = 100)
    private String districtTa;

    @Column(name = "taluk", nullable = false, length = 100)
    private String taluk;

    @Column(name = "block", nullable = false, length = 100)
    private String block;

    @Column(name = "revenue_village", nullable = false, length = 100)
    private String revenueVillage;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "nearby_landmark", columnDefinition = "TEXT")
    private String nearbyLandmark;

    @Column(name = "pincode", nullable = false, length = 6)
    private String pincode;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "google_maps_url", nullable = false, columnDefinition = "TEXT")
    private String googleMapsUrl;

    @Column(name = "market_category", nullable = false, length = 50)
    private String marketCategory;

    @Column(name = "ownership", nullable = false, length = 50)
    private String ownership;

    @Column(name = "managing_department", nullable = false, length = 150)
    private String managingDepartment;

    @Column(name = "market_status", nullable = false, length = 20)
    private String marketStatus;

    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime;

    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime;

    @Column(name = "working_days", nullable = false, length = 100)
    private String workingDays;

    @Column(name = "holiday_information", columnDefinition = "TEXT")
    private String holidayInformation;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "alternate_phone", length = 20)
    private String alternatePhone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "official_website", columnDefinition = "TEXT")
    private String officialWebsite;

    @Column(name = "year_established")
    private Integer yearEstablished;

    @Column(name = "market_capacity_tons")
    private Double marketCapacityTons;

    @Column(name = "parking_available")
    private Boolean parkingAvailable;

    @Column(name = "toilet_facility")
    private Boolean toiletFacility;

    @Column(name = "drinking_water")
    private Boolean drinkingWater;

    @Column(name = "rest_area")
    private Boolean restArea;

    @Column(name = "digital_payment_available")
    private Boolean digitalPaymentAvailable;

    @Column(name = "auction_facility")
    private Boolean auctionFacility;

    @Column(name = "storage_facility")
    private Boolean storageFacility;

    @Column(name = "warehouse_available")
    private Boolean warehouseAvailable;

    @Column(name = "cold_storage_available")
    private Boolean coldStorageAvailable;

    @Column(name = "weighbridge_available")
    private Boolean weighbridgeAvailable;

    @Column(name = "loading_facility")
    private Boolean loadingFacility;

    @Column(name = "transport_facility")
    private Boolean transportFacility;

    @Column(name = "accessibility_friendly")
    private Boolean accessibilityFriendly;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "last_verified_date", nullable = false)
    private LocalDate lastVerifiedDate;

    @Column(name = "data_source", nullable = false, columnDefinition = "TEXT")
    private String dataSource;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public MarketEntity() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getUniqueMarketId() { return uniqueMarketId; }
    public void setUniqueMarketId(String uniqueMarketId) { this.uniqueMarketId = uniqueMarketId; }

    public String getOfficialMarketCode() { return officialMarketCode; }
    public void setOfficialMarketCode(String officialMarketCode) { this.officialMarketCode = officialMarketCode; }

    public String getOfficialMarketNameEn() { return officialMarketNameEn; }
    public void setOfficialMarketNameEn(String officialMarketNameEn) { this.officialMarketNameEn = officialMarketNameEn; }

    public String getOfficialMarketNameTa() { return officialMarketNameTa; }
    public void setOfficialMarketNameTa(String officialMarketNameTa) { this.officialMarketNameTa = officialMarketNameTa; }

    public String getCommonName() { return commonName; }
    public void setCommonName(String commonName) { this.commonName = commonName; }

    public DistrictEntity getDistrict() { return district; }
    public void setDistrict(DistrictEntity district) { this.district = district; }

    public String getDistrictTa() { return districtTa; }
    public void setDistrictTa(String districtTa) { this.districtTa = districtTa; }

    public String getTaluk() { return taluk; }
    public void setTaluk(String taluk) { this.taluk = taluk; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getRevenueVillage() { return revenueVillage; }
    public void setRevenueVillage(String revenueVillage) { this.revenueVillage = revenueVillage; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getNearbyLandmark() { return nearbyLandmark; }
    public void setNearbyLandmark(String nearbyLandmark) { this.nearbyLandmark = nearbyLandmark; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getGoogleMapsUrl() { return googleMapsUrl; }
    public void setGoogleMapsUrl(String googleMapsUrl) { this.googleMapsUrl = googleMapsUrl; }

    public String getMarketCategory() { return marketCategory; }
    public void setMarketCategory(String marketCategory) { this.marketCategory = marketCategory; }

    public String getOwnership() { return ownership; }
    public void setOwnership(String ownership) { this.ownership = ownership; }

    public String getManagingDepartment() { return managingDepartment; }
    public void setManagingDepartment(String managingDepartment) { this.managingDepartment = managingDepartment; }

    public String getMarketStatus() { return marketStatus; }
    public void setMarketStatus(String marketStatus) { this.marketStatus = marketStatus; }

    public LocalTime getOpeningTime() { return openingTime; }
    public void setOpeningTime(LocalTime openingTime) { this.openingTime = openingTime; }

    public LocalTime getClosingTime() { return closingTime; }
    public void setClosingTime(LocalTime closingTime) { this.closingTime = closingTime; }

    public String getWorkingDays() { return workingDays; }
    public void setWorkingDays(String workingDays) { this.workingDays = workingDays; }

    public String getHolidayInformation() { return holidayInformation; }
    public void setHolidayInformation(String holidayInformation) { this.holidayInformation = holidayInformation; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAlternatePhone() { return alternatePhone; }
    public void setAlternatePhone(String alternatePhone) { this.alternatePhone = alternatePhone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOfficialWebsite() { return officialWebsite; }
    public void setOfficialWebsite(String officialWebsite) { this.officialWebsite = officialWebsite; }

    public Integer getYearEstablished() { return yearEstablished; }
    public void setYearEstablished(Integer yearEstablished) { this.yearEstablished = yearEstablished; }

    public Double getMarketCapacityTons() { return marketCapacityTons; }
    public void setMarketCapacityTons(Double marketCapacityTons) { this.marketCapacityTons = marketCapacityTons; }

    public Boolean getParkingAvailable() { return parkingAvailable; }
    public void setParkingAvailable(Boolean parkingAvailable) { this.parkingAvailable = parkingAvailable; }

    public Boolean getToiletFacility() { return toiletFacility; }
    public void setToiletFacility(Boolean toiletFacility) { this.toiletFacility = toiletFacility; }

    public Boolean getDrinkingWater() { return drinkingWater; }
    public void setDrinkingWater(Boolean drinkingWater) { this.drinkingWater = drinkingWater; }

    public Boolean getRestArea() { return restArea; }
    public void setRestArea(Boolean restArea) { this.restArea = restArea; }

    public Boolean getDigitalPaymentAvailable() { return digitalPaymentAvailable; }
    public void setDigitalPaymentAvailable(Boolean digitalPaymentAvailable) { this.digitalPaymentAvailable = digitalPaymentAvailable; }

    public Boolean getAuctionFacility() { return auctionFacility; }
    public void setAuctionFacility(Boolean auctionFacility) { this.auctionFacility = auctionFacility; }

    public Boolean getStorageFacility() { return storageFacility; }
    public void setStorageFacility(Boolean storageFacility) { this.storageFacility = storageFacility; }

    public Boolean getWarehouseAvailable() { return warehouseAvailable; }
    public void setWarehouseAvailable(Boolean warehouseAvailable) { this.warehouseAvailable = warehouseAvailable; }

    public Boolean getColdStorageAvailable() { return coldStorageAvailable; }
    public void setColdStorageAvailable(Boolean coldStorageAvailable) { this.coldStorageAvailable = coldStorageAvailable; }

    public Boolean getWeighbridgeAvailable() { return weighbridgeAvailable; }
    public void setWeighbridgeAvailable(Boolean weighbridgeAvailable) { this.weighbridgeAvailable = weighbridgeAvailable; }

    public Boolean getLoadingFacility() { return loadingFacility; }
    public void setLoadingFacility(Boolean loadingFacility) { this.loadingFacility = loadingFacility; }

    public Boolean getTransportFacility() { return transportFacility; }
    public void setTransportFacility(Boolean transportFacility) { this.transportFacility = transportFacility; }

    public Boolean getAccessibilityFriendly() { return accessibilityFriendly; }
    public void setAccessibilityFriendly(Boolean accessibilityFriendly) { this.accessibilityFriendly = accessibilityFriendly; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public LocalDate getLastVerifiedDate() { return lastVerifiedDate; }
    public void setLastVerifiedDate(LocalDate lastVerifiedDate) { this.lastVerifiedDate = lastVerifiedDate; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
