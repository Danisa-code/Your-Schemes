package com.farmersportal.dto;

public class CommodityDTO {
    private String id;
    private String name;

    public CommodityDTO() {}

    public CommodityDTO(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public static CommodityDTOBuilder builder() {
        return new CommodityDTOBuilder();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public static class CommodityDTOBuilder {
        private String id;
        private String name;

        CommodityDTOBuilder() {}

        public CommodityDTOBuilder id(String id) { this.id = id; return this; }
        public CommodityDTOBuilder name(String name) { this.name = name; return this; }

        public CommodityDTO build() {
            return new CommodityDTO(id, name);
        }
    }
}
