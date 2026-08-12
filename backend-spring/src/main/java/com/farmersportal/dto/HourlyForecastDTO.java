package com.farmersportal.dto;

public class HourlyForecastDTO {
    private String time;
    private Double temperature;
    private Double rain;
    private Double precipitationProbability;
    private Double precipitation;
    private Integer weatherCode;
    private Double windSpeed;
    private Double windDirection;
    private Double cloudCover;
    private Double visibility;
    private Double uvIndex;
    private Double relativeHumidity;
    private Double feelsLikeTemperature;

    public HourlyForecastDTO() {}

    public HourlyForecastDTO(String time, Double temperature, Double rain, Double precipitationProbability, Double precipitation, Integer weatherCode, Double windSpeed, Double windDirection, Double cloudCover, Double visibility, Double uvIndex, Double relativeHumidity, Double feelsLikeTemperature) {
        this.time = time;
        this.temperature = temperature;
        this.rain = rain;
        this.precipitationProbability = precipitationProbability;
        this.precipitation = precipitation;
        this.weatherCode = weatherCode;
        this.windSpeed = windSpeed;
        this.windDirection = windDirection;
        this.cloudCover = cloudCover;
        this.visibility = visibility;
        this.uvIndex = uvIndex;
        this.relativeHumidity = relativeHumidity;
        this.feelsLikeTemperature = feelsLikeTemperature;
    }

    public static HourlyForecastDTOBuilder builder() {
        return new HourlyForecastDTOBuilder();
    }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }
    public Double getRain() { return rain; }
    public void setRain(Double rain) { this.rain = rain; }
    public Double getPrecipitationProbability() { return precipitationProbability; }
    public void setPrecipitationProbability(Double precipitationProbability) { this.precipitationProbability = precipitationProbability; }
    public Double getPrecipitation() { return precipitation; }
    public void setPrecipitation(Double precipitation) { this.precipitation = precipitation; }
    public Integer getWeatherCode() { return weatherCode; }
    public void setWeatherCode(Integer weatherCode) { this.weatherCode = weatherCode; }
    public Double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }
    public Double getWindDirection() { return windDirection; }
    public void setWindDirection(Double windDirection) { this.windDirection = windDirection; }
    public Double getCloudCover() { return cloudCover; }
    public void setCloudCover(Double cloudCover) { this.cloudCover = cloudCover; }
    public Double getVisibility() { return visibility; }
    public void setVisibility(Double visibility) { this.visibility = visibility; }
    public Double getUvIndex() { return uvIndex; }
    public void setUvIndex(Double uvIndex) { this.uvIndex = uvIndex; }
    public Double getRelativeHumidity() { return relativeHumidity; }
    public void setRelativeHumidity(Double relativeHumidity) { this.relativeHumidity = relativeHumidity; }
    public Double getFeelsLikeTemperature() { return feelsLikeTemperature; }
    public void setFeelsLikeTemperature(Double feelsLikeTemperature) { this.feelsLikeTemperature = feelsLikeTemperature; }

    public static class HourlyForecastDTOBuilder {
        private String time;
        private Double temperature;
        private Double rain;
        private Double precipitationProbability;
        private Double precipitation;
        private Integer weatherCode;
        private Double windSpeed;
        private Double windDirection;
        private Double cloudCover;
        private Double visibility;
        private Double uvIndex;
        private Double relativeHumidity;
        private Double feelsLikeTemperature;

        public HourlyForecastDTOBuilder time(String time) { this.time = time; return this; }
        public HourlyForecastDTOBuilder temperature(Double temperature) { this.temperature = temperature; return this; }
        public HourlyForecastDTOBuilder rain(Double rain) { this.rain = rain; return this; }
        public HourlyForecastDTOBuilder precipitationProbability(Double precipitationProbability) { this.precipitationProbability = precipitationProbability; return this; }
        public HourlyForecastDTOBuilder precipitation(Double precipitation) { this.precipitation = precipitation; return this; }
        public HourlyForecastDTOBuilder weatherCode(Integer weatherCode) { this.weatherCode = weatherCode; return this; }
        public HourlyForecastDTOBuilder windSpeed(Double windSpeed) { this.windSpeed = windSpeed; return this; }
        public HourlyForecastDTOBuilder windDirection(Double windDirection) { this.windDirection = windDirection; return this; }
        public HourlyForecastDTOBuilder cloudCover(Double cloudCover) { this.cloudCover = cloudCover; return this; }
        public HourlyForecastDTOBuilder visibility(Double visibility) { this.visibility = visibility; return this; }
        public HourlyForecastDTOBuilder uvIndex(Double uvIndex) { this.uvIndex = uvIndex; return this; }
        public HourlyForecastDTOBuilder relativeHumidity(Double relativeHumidity) { this.relativeHumidity = relativeHumidity; return this; }
        public HourlyForecastDTOBuilder feelsLikeTemperature(Double feelsLikeTemperature) { this.feelsLikeTemperature = feelsLikeTemperature; return this; }

        public HourlyForecastDTO build() {
            return new HourlyForecastDTO(time, temperature, rain, precipitationProbability, precipitation, weatherCode, windSpeed, windDirection, cloudCover, visibility, uvIndex, relativeHumidity, feelsLikeTemperature);
        }
    }
}
