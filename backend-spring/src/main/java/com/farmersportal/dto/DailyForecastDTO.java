package com.farmersportal.dto;

public class DailyForecastDTO {
    private String date;
    private Double maxTemperature;
    private Double minTemperature;
    private Double apparentMaxTemperature;
    private Double apparentMinTemperature;
    private Double totalRain;
    private Double maxRainProbability;
    private Integer weatherCode;
    private Double maxWindSpeed;
    private Double maxUvIndex;
    private String sunrise;
    private String sunset;
    private Double daylightDuration;
    private Double sunshineDuration;

    public DailyForecastDTO() {}

    public DailyForecastDTO(String date, Double maxTemperature, Double minTemperature, Double apparentMaxTemperature, Double apparentMinTemperature, Double totalRain, Double maxRainProbability, Integer weatherCode, Double maxWindSpeed, Double maxUvIndex, String sunrise, String sunset, Double daylightDuration, Double sunshineDuration) {
        this.date = date;
        this.maxTemperature = maxTemperature;
        this.minTemperature = minTemperature;
        this.apparentMaxTemperature = apparentMaxTemperature;
        this.apparentMinTemperature = apparentMinTemperature;
        this.totalRain = totalRain;
        this.maxRainProbability = maxRainProbability;
        this.weatherCode = weatherCode;
        this.maxWindSpeed = maxWindSpeed;
        this.maxUvIndex = maxUvIndex;
        this.sunrise = sunrise;
        this.sunset = sunset;
        this.daylightDuration = daylightDuration;
        this.sunshineDuration = sunshineDuration;
    }

    public static DailyForecastDTOBuilder builder() {
        return new DailyForecastDTOBuilder();
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public Double getMaxTemperature() { return maxTemperature; }
    public void setMaxTemperature(Double maxTemperature) { this.maxTemperature = maxTemperature; }
    public Double getMinTemperature() { return minTemperature; }
    public void setMinTemperature(Double minTemperature) { this.minTemperature = minTemperature; }
    public Double getApparentMaxTemperature() { return apparentMaxTemperature; }
    public void setApparentMaxTemperature(Double apparentMaxTemperature) { this.apparentMaxTemperature = apparentMaxTemperature; }
    public Double getApparentMinTemperature() { return apparentMinTemperature; }
    public void setApparentMinTemperature(Double apparentMinTemperature) { this.apparentMinTemperature = apparentMinTemperature; }
    public Double getTotalRain() { return totalRain; }
    public void setTotalRain(Double totalRain) { this.totalRain = totalRain; }
    public Double getMaxRainProbability() { return maxRainProbability; }
    public void setMaxRainProbability(Double maxRainProbability) { this.maxRainProbability = maxRainProbability; }
    public Integer getWeatherCode() { return weatherCode; }
    public void setWeatherCode(Integer weatherCode) { this.weatherCode = weatherCode; }
    public Double getMaxWindSpeed() { return maxWindSpeed; }
    public void setMaxWindSpeed(Double maxWindSpeed) { this.maxWindSpeed = maxWindSpeed; }
    public Double getMaxUvIndex() { return maxUvIndex; }
    public void setMaxUvIndex(Double maxUvIndex) { this.maxUvIndex = maxUvIndex; }
    public String getSunrise() { return sunrise; }
    public void setSunrise(String sunrise) { this.sunrise = sunrise; }
    public String getSunset() { return sunset; }
    public void setSunset(String sunset) { this.sunset = sunset; }
    public Double getDaylightDuration() { return daylightDuration; }
    public void setDaylightDuration(Double daylightDuration) { this.daylightDuration = daylightDuration; }
    public Double getSunshineDuration() { return sunshineDuration; }
    public void setSunshineDuration(Double sunshineDuration) { this.sunshineDuration = sunshineDuration; }

    public static class DailyForecastDTOBuilder {
        private String date;
        private Double maxTemperature;
        private Double minTemperature;
        private Double apparentMaxTemperature;
        private Double apparentMinTemperature;
        private Double totalRain;
        private Double maxRainProbability;
        private Integer weatherCode;
        private Double maxWindSpeed;
        private Double maxUvIndex;
        private String sunrise;
        private String sunset;
        private Double daylightDuration;
        private Double sunshineDuration;

        public DailyForecastDTOBuilder date(String date) { this.date = date; return this; }
        public DailyForecastDTOBuilder maxTemperature(Double maxTemperature) { this.maxTemperature = maxTemperature; return this; }
        public DailyForecastDTOBuilder minTemperature(Double minTemperature) { this.minTemperature = minTemperature; return this; }
        public DailyForecastDTOBuilder apparentMaxTemperature(Double apparentMaxTemperature) { this.apparentMaxTemperature = apparentMaxTemperature; return this; }
        public DailyForecastDTOBuilder apparentMinTemperature(Double apparentMinTemperature) { this.apparentMinTemperature = apparentMinTemperature; return this; }
        public DailyForecastDTOBuilder totalRain(Double totalRain) { this.totalRain = totalRain; return this; }
        public DailyForecastDTOBuilder maxRainProbability(Double maxRainProbability) { this.maxRainProbability = maxRainProbability; return this; }
        public DailyForecastDTOBuilder weatherCode(Integer weatherCode) { this.weatherCode = weatherCode; return this; }
        public DailyForecastDTOBuilder maxWindSpeed(Double maxWindSpeed) { this.maxWindSpeed = maxWindSpeed; return this; }
        public DailyForecastDTOBuilder maxUvIndex(Double maxUvIndex) { this.maxUvIndex = maxUvIndex; return this; }
        public DailyForecastDTOBuilder sunrise(String sunrise) { this.sunrise = sunrise; return this; }
        public DailyForecastDTOBuilder sunset(String sunset) { this.sunset = sunset; return this; }
        public DailyForecastDTOBuilder daylightDuration(Double daylightDuration) { this.daylightDuration = daylightDuration; return this; }
        public DailyForecastDTOBuilder sunshineDuration(Double sunshineDuration) { this.sunshineDuration = sunshineDuration; return this; }

        public DailyForecastDTO build() {
            return new DailyForecastDTO(date, maxTemperature, minTemperature, apparentMaxTemperature, apparentMinTemperature, totalRain, maxRainProbability, weatherCode, maxWindSpeed, maxUvIndex, sunrise, sunset, daylightDuration, sunshineDuration);
        }
    }
}
