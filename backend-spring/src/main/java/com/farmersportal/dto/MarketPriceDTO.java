package com.farmersportal.dto;

public class MarketPriceDTO {
    private String commodity;
    private String market;
    private String district;
    private String state;
    private String arrivalDate;
    private Double minimumPrice;
    private Double maximumPrice;
    private Double modalPrice;
    private String unit;

    public MarketPriceDTO() {}

    public MarketPriceDTO(String commodity, String market, String district, String state, String arrivalDate, Double minimumPrice, Double maximumPrice, Double modalPrice, String unit) {
        this.commodity = commodity;
        this.market = market;
        this.district = district;
        this.state = state;
        this.arrivalDate = arrivalDate;
        this.minimumPrice = minimumPrice;
        this.maximumPrice = maximumPrice;
        this.modalPrice = modalPrice;
        this.unit = unit;
    }

    public static MarketPriceDTOBuilder builder() {
        return new MarketPriceDTOBuilder();
    }

    // Getters and Setters
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

    public static class MarketPriceDTOBuilder {
        private String commodity;
        private String market;
        private String district;
        private String state;
        private String arrivalDate;
        private Double minimumPrice;
        private Double maximumPrice;
        private Double modalPrice;
        private String unit;

        MarketPriceDTOBuilder() {}

        public MarketPriceDTOBuilder commodity(String commodity) { this.commodity = commodity; return this; }
        public MarketPriceDTOBuilder market(String market) { this.market = market; return this; }
        public MarketPriceDTOBuilder district(String district) { this.district = district; return this; }
        public MarketPriceDTOBuilder state(String state) { this.state = state; return this; }
        public MarketPriceDTOBuilder arrivalDate(String arrivalDate) { this.arrivalDate = arrivalDate; return this; }
        public MarketPriceDTOBuilder minimumPrice(Double minimumPrice) { this.minimumPrice = minimumPrice; return this; }
        public MarketPriceDTOBuilder maximumPrice(Double maximumPrice) { this.maximumPrice = maximumPrice; return this; }
        public MarketPriceDTOBuilder modalPrice(Double modalPrice) { this.modalPrice = modalPrice; return this; }
        public MarketPriceDTOBuilder unit(String unit) { this.unit = unit; return this; }

        public MarketPriceDTO build() {
            return new MarketPriceDTO(commodity, market, district, state, arrivalDate, minimumPrice, maximumPrice, modalPrice, unit);
        }
    }
}
