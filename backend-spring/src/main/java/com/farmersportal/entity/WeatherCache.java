package com.farmersportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "weather_cache")
public class WeatherCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private Double temperature;

    private Double humidity;

    @Column(name = "wind_speed")
    private Double windSpeed;

    @Column(name = "rain_probability")
    private Double rainProbability;

    @Column(name = "weather_code")
    private Integer weatherCode;

    @Column(name = "max_temperature")
    private Double maxTemperature;

    @Column(name = "min_temperature")
    private Double minTemperature;

    @Column(name = "forecast_json", columnDefinition = "TEXT")
    private String forecastJson;

    @Column(name = "cached_at")
    private LocalDateTime cachedAt;

    public WeatherCache() {}

    public WeatherCache(Long id, Double latitude, Double longitude, Double temperature, Double humidity, Double windSpeed, Double rainProbability, Integer weatherCode, Double maxTemperature, Double minTemperature, String forecastJson, LocalDateTime cachedAt) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.temperature = temperature;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.rainProbability = rainProbability;
        this.weatherCode = weatherCode;
        this.maxTemperature = maxTemperature;
        this.minTemperature = minTemperature;
        this.forecastJson = forecastJson;
        this.cachedAt = cachedAt;
    }

    public static WeatherCacheBuilder builder() {
        return new WeatherCacheBuilder();
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        cachedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }
    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }
    public Double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }
    public Double getRainProbability() { return rainProbability; }
    public void setRainProbability(Double rainProbability) { this.rainProbability = rainProbability; }
    public Integer getWeatherCode() { return weatherCode; }
    public void setWeatherCode(Integer weatherCode) { this.weatherCode = weatherCode; }
    public Double getMaxTemperature() { return maxTemperature; }
    public void setMaxTemperature(Double maxTemperature) { this.maxTemperature = maxTemperature; }
    public Double getMinTemperature() { return minTemperature; }
    public void setMinTemperature(Double minTemperature) { this.minTemperature = minTemperature; }
    public String getForecastJson() { return forecastJson; }
    public void setForecastJson(String forecastJson) { this.forecastJson = forecastJson; }
    public LocalDateTime getCachedAt() { return cachedAt; }
    public void setCachedAt(LocalDateTime cachedAt) { this.cachedAt = cachedAt; }

    public static class WeatherCacheBuilder {
        private Long id;
        private Double latitude;
        private Double longitude;
        private Double temperature;
        private Double humidity;
        private Double windSpeed;
        private Double rainProbability;
        private Integer weatherCode;
        private Double maxTemperature;
        private Double minTemperature;
        private String forecastJson;
        private LocalDateTime cachedAt;

        WeatherCacheBuilder() {}

        public WeatherCacheBuilder id(Long id) { this.id = id; return this; }
        public WeatherCacheBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public WeatherCacheBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public WeatherCacheBuilder temperature(Double temperature) { this.temperature = temperature; return this; }
        public WeatherCacheBuilder humidity(Double humidity) { this.humidity = humidity; return this; }
        public WeatherCacheBuilder windSpeed(Double windSpeed) { this.windSpeed = windSpeed; return this; }
        public WeatherCacheBuilder rainProbability(Double rainProbability) { this.rainProbability = rainProbability; return this; }
        public WeatherCacheBuilder weatherCode(Integer weatherCode) { this.weatherCode = weatherCode; return this; }
        public WeatherCacheBuilder maxTemperature(Double maxTemperature) { this.maxTemperature = maxTemperature; return this; }
        public WeatherCacheBuilder minTemperature(Double minTemperature) { this.minTemperature = minTemperature; return this; }
        public WeatherCacheBuilder forecastJson(String forecastJson) { this.forecastJson = forecastJson; return this; }
        public WeatherCacheBuilder cachedAt(LocalDateTime cachedAt) { this.cachedAt = cachedAt; return this; }

        public WeatherCache build() {
            return new WeatherCache(id, latitude, longitude, temperature, humidity, windSpeed, rainProbability, weatherCode, maxTemperature, minTemperature, forecastJson, cachedAt);
        }
    }
}
