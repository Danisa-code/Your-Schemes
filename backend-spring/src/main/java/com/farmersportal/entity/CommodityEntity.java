package com.farmersportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tn_commodities")
public class CommodityEntity {

    @Id
    @Column(name = "commodity_id", length = 20)
    private String commodityId;

    @Column(name = "english_name", nullable = false, unique = true, length = 100)
    private String englishName;

    @Column(name = "tamil_name", nullable = false, unique = true, length = 100)
    private String tamilName;

    @Column(name = "scientific_name", nullable = false, length = 150)
    private String scientificName;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "subcategory", nullable = false, length = 100)
    private String subcategory;

    @Column(name = "typical_unit", nullable = false, length = 30)
    private String typicalUnit;

    @Column(name = "season", nullable = false, length = 30)
    private String season;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CommodityEntity() {}

    public CommodityEntity(String commodityId, String englishName, String tamilName, String scientificName, String category, String subcategory, String typicalUnit, String season, String imageUrl) {
        this.commodityId = commodityId;
        this.englishName = englishName;
        this.tamilName = tamilName;
        this.scientificName = scientificName;
        this.category = category;
        this.subcategory = subcategory;
        this.typicalUnit = typicalUnit;
        this.season = season;
        this.imageUrl = imageUrl;
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

    // Getters and Setters
    public String getCommodityId() { return commodityId; }
    public void setCommodityId(String commodityId) { this.commodityId = commodityId; }

    public String getEnglishName() { return englishName; }
    public void setEnglishName(String englishName) { this.englishName = englishName; }

    public String getTamilName() { return tamilName; }
    public void setTamilName(String tamilName) { this.tamilName = tamilName; }

    public String getScientificName() { return scientificName; }
    public void setScientificName(String scientificName) { this.scientificName = scientificName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public String getTypicalUnit() { return typicalUnit; }
    public void setTypicalUnit(String typicalUnit) { this.typicalUnit = typicalUnit; }

    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
