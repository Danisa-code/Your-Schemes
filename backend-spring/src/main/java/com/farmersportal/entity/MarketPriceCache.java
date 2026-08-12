package com.farmersportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "market_price_cache")
public class MarketPriceCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String commodity;

    @Column(nullable = false)
    private String market;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String state;

    @Column(name = "arrival_date")
    private String arrivalDate;

    @Column(name = "min_price")
    private Double minimumPrice;

    @Column(name = "max_price")
    private Double maximumPrice;

    @Column(name = "modal_price")
    private Double modalPrice;

    private String unit;

    @Column(name = "cached_at")
    private LocalDateTime cachedAt;

    public MarketPriceCache() {}

    public MarketPriceCache(Long id, String commodity, String market, String district, String state, String arrivalDate, Double minimumPrice, Double maximumPrice, Double modalPrice, String unit, LocalDateTime cachedAt) {
        this.id = id;
        this.commodity = commodity;
        this.market = market;
        this.district = district;
        this.state = state;
        this.arrivalDate = arrivalDate;
        this.minimumPrice = minimumPrice;
        this.maximumPrice = maximumPrice;
        this.modalPrice = modalPrice;
        this.unit = unit;
        this.cachedAt = cachedAt;
    }

    public static MarketPriceCacheBuilder builder() {
        return new MarketPriceCacheBuilder();
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        cachedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCommodity() { return commodity; }
    public void setCommodity(String commodity) { this.commodity = commodity; }
    public String getMarket() { return market; }
    public void setMarket(String market) { this.market = market; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getArrivalDate() { return arrivalDate; }
    public void setArrivalDate(String arrivalDate) { this.arrivalDate = arrivalDate; }
    public Double getMinimumPrice() { return minimumPrice; }
    public void setMinimumPrice(Double minimumPrice) { this.minimumPrice = minimumPrice; }
    public Double getMaximumPrice() { return maximumPrice; }
    public void setMaximumPrice(Double maximumPrice) { this.maximumPrice = maximumPrice; }
    public Double getModalPrice() { return modalPrice; }
    public void setModalPrice(Double modalPrice) { this.modalPrice = modalPrice; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public LocalDateTime getCachedAt() { return cachedAt; }
    public void setCachedAt(LocalDateTime cachedAt) { this.cachedAt = cachedAt; }

    public static class MarketPriceCacheBuilder {
        private Long id;
        private String commodity;
        private String market;
        private String district;
        private String state;
        private String arrivalDate;
        private Double minimumPrice;
        private Double maximumPrice;
        private Double modalPrice;
        private String unit;
        private LocalDateTime cachedAt;

        MarketPriceCacheBuilder() {}

        public MarketPriceCacheBuilder id(Long id) { this.id = id; return this; }
        public MarketPriceCacheBuilder commodity(String commodity) { this.commodity = commodity; return this; }
        public MarketPriceCacheBuilder market(String market) { this.market = market; return this; }
        public MarketPriceCacheBuilder district(String district) { this.district = district; return this; }
        public MarketPriceCacheBuilder state(String state) { this.state = state; return this; }
        public MarketPriceCacheBuilder arrivalDate(String arrivalDate) { this.arrivalDate = arrivalDate; return this; }
        public MarketPriceCacheBuilder minimumPrice(Double minimumPrice) { this.minimumPrice = minimumPrice; return this; }
        public MarketPriceCacheBuilder maximumPrice(Double maximumPrice) { this.maximumPrice = maximumPrice; return this; }
        public MarketPriceCacheBuilder modalPrice(Double modalPrice) { this.modalPrice = modalPrice; return this; }
        public MarketPriceCacheBuilder unit(String unit) { this.unit = unit; return this; }
        public MarketPriceCacheBuilder cachedAt(LocalDateTime cachedAt) { this.cachedAt = cachedAt; return this; }

        public MarketPriceCache build() {
            return new MarketPriceCache(id, commodity, market, district, state, arrivalDate, minimumPrice, maximumPrice, modalPrice, unit, cachedAt);
        }
    }
}
