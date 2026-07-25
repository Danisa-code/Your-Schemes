package com.farmersportal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tn_daily_prices", indexes = {
    @Index(name = "idx_tn_daily_prices_market_date", columnList = "market_id, arrival_date"),
    @Index(name = "idx_tn_daily_prices_commodity", columnList = "commodity_id")
})
public class DailyPriceEntity {

    @Id
    @Column(name = "price_id", length = 50)
    private String priceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private MarketEntity market;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commodity_id", nullable = false)
    private CommodityEntity commodity;

    @Column(name = "arrival_date", nullable = false)
    private LocalDate arrivalDate;

    @Column(name = "minimum_price", nullable = false)
    private Double minimumPrice;

    @Column(name = "maximum_price", nullable = false)
    private Double maximumPrice;

    @Column(name = "modal_price", nullable = false)
    private Double modalPrice;

    @Column(name = "unit", nullable = false, length = 30)
    private String unit;

    @Column(name = "arrival_quantity_tons")
    private Double arrivalQuantityTons;

    @Column(name = "source", nullable = false, length = 100)
    private String source;

    @Column(name = "updated_time", nullable = false)
    private LocalDateTime updatedTime;

    @Column(name = "verification_status", nullable = false, length = 30)
    private String verificationStatus;

    public DailyPriceEntity() {}

    public DailyPriceEntity(String priceId, MarketEntity market, CommodityEntity commodity, LocalDate arrivalDate, Double minimumPrice, Double maximumPrice, Double modalPrice, String unit, Double arrivalQuantityTons, String source, LocalDateTime updatedTime, String verificationStatus) {
        this.priceId = priceId;
        this.market = market;
        this.commodity = commodity;
        this.arrivalDate = arrivalDate;
        this.minimumPrice = minimumPrice;
        this.maximumPrice = maximumPrice;
        this.modalPrice = modalPrice;
        this.unit = unit;
        this.arrivalQuantityTons = arrivalQuantityTons;
        this.source = source;
        this.updatedTime = updatedTime;
        this.verificationStatus = verificationStatus;
    }

    // Getters and Setters
    public String getPriceId() { return priceId; }
    public void setPriceId(String priceId) { this.priceId = priceId; }

    public MarketEntity getMarket() { return market; }
    public void setMarket(MarketEntity market) { this.market = market; }

    public CommodityEntity getCommodity() { return commodity; }
    public void setCommodity(CommodityEntity commodity) { this.commodity = commodity; }

    public LocalDate getArrivalDate() { return arrivalDate; }
    public void setArrivalDate(LocalDate arrivalDate) { this.arrivalDate = arrivalDate; }

    public Double getMinimumPrice() { return minimumPrice; }
    public void setMinimumPrice(Double minimumPrice) { this.minimumPrice = minimumPrice; }

    public Double getMaximumPrice() { return maximumPrice; }
    public void setMaximumPrice(Double maximumPrice) { this.maximumPrice = maximumPrice; }

    public Double getModalPrice() { return modalPrice; }
    public void setModalPrice(Double modalPrice) { this.modalPrice = modalPrice; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Double getArrivalQuantityTons() { return arrivalQuantityTons; }
    public void setArrivalQuantityTons(Double arrivalQuantityTons) { this.arrivalQuantityTons = arrivalQuantityTons; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public LocalDateTime getUpdatedTime() { return updatedTime; }
    public void setUpdatedTime(LocalDateTime updatedTime) { this.updatedTime = updatedTime; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
}
