package com.farmersportal.dto;

import java.util.List;

public class MandiPricesResponseDTO {
    private List<MarketPriceDTO> data;
    private boolean isCached;
    private String lastUpdated;

    public MandiPricesResponseDTO() {}

    public MandiPricesResponseDTO(List<MarketPriceDTO> data, boolean isCached, String lastUpdated) {
        this.data = data;
        this.isCached = isCached;
        this.lastUpdated = lastUpdated;
    }

    public static MandiPricesResponseDTOBuilder builder() {
        return new MandiPricesResponseDTOBuilder();
    }

    // Getters and Setters
    public List<MarketPriceDTO> getData() { return data; }
    public void setData(List<MarketPriceDTO> data) { this.data = data; }
    public boolean isCached() { return isCached; }
    public void setCached(boolean isCached) { this.isCached = isCached; }
    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }

    public static class MandiPricesResponseDTOBuilder {
        private List<MarketPriceDTO> data;
        private boolean isCached;
        private String lastUpdated;

        MandiPricesResponseDTOBuilder() {}

        public MandiPricesResponseDTOBuilder data(List<MarketPriceDTO> data) { this.data = data; return this; }
        public MandiPricesResponseDTOBuilder isCached(boolean isCached) { this.isCached = isCached; return this; }
        public MandiPricesResponseDTOBuilder lastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; return this; }

        public MandiPricesResponseDTO build() {
            return new MandiPricesResponseDTO(data, isCached, lastUpdated);
        }
    }
}
