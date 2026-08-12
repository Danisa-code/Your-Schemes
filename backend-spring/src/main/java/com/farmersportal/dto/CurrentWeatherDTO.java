package com.farmersportal.dto;

public class CurrentWeatherDTO {
    private Double temperature;
    private Double feelsLikeTemperature;
    private Double relativeHumidity;
    private Integer weatherCode;
    private Double cloudCover;
    private Double rain;
    private Double precipitation;
    private Double windSpeed;
    private Double windDirection;
    private Integer isDay;

    public CurrentWeatherDTO() {}

    public CurrentWeatherDTO(Double temperature, Double feelsLikeTemperature, Double relativeHumidity, Integer weatherCode, Double cloudCover, Double rain, Double precipitation, Double windSpeed, Double windDirection, Integer isDay) {
        this.temperature = temperature;
        this.feelsLikeTemperature = feelsLikeTemperature;
        this.relativeHumidity = relativeHumidity;
        this.weatherCode = weatherCode;
        this.cloudCover = cloudCover;
        this.rain = rain;
        this.precipitation = precipitation;
        this.windSpeed = windSpeed;
        this.windDirection = windDirection;
        this.isDay = isDay;
    }

    public static WeatherResponseDTOBuilder builder() {
        return new WeatherResponseDTOBuilder();
    }

    public static class WeatherResponseDTOBuilder {
        private Double temperature;
        private Double feelsLikeTemperature;
        private Double relativeHumidity;
        private Integer weatherCode;
        private Double cloudCover;
        private Double rain;
        private Double precipitation;
        private Double windSpeed;
        private Double windDirection;
        private Integer isDay;

        public WeatherResponseDTOBuilder temperature(Double temperature) { this.temperature = temperature; return this; }
        public WeatherResponseDTOBuilder feelsLikeTemperature(Double feelsLikeTemperature) { this.feelsLikeTemperature = feelsLikeTemperature; return this; }
        public WeatherResponseDTOBuilder relativeHumidity(Double relativeHumidity) { this.relativeHumidity = relativeHumidity; return this; }
        public WeatherResponseDTOBuilder weatherCode(Integer weatherCode) { this.weatherCode = weatherCode; return this; }
        public WeatherResponseDTOBuilder cloudCover(Double cloudCover) { this.cloudCover = cloudCover; return this; }
        public WeatherResponseDTOBuilder rain(Double rain) { this.rain = rain; return this; }
        public WeatherResponseDTOBuilder precipitation(Double precipitation) { this.precipitation = precipitation; return this; }
        public WeatherResponseDTOBuilder windSpeed(Double windSpeed) { this.windSpeed = windSpeed; return this; }
        public WeatherResponseDTOBuilder windDirection(Double windDirection) { this.windDirection = windDirection; return this; }
        public WeatherResponseDTOBuilder isDay(Integer isDay) { this.isDay = isDay; return this; }

        public CurrentWeatherDTO build() {
            return new CurrentWeatherDTO(temperature, feelsLikeTemperature, relativeHumidity, weatherCode, cloudCover, rain, precipitation, windSpeed, windDirection, isDay);
        }
    }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }
    public Double getFeelsLikeTemperature() { return feelsLikeTemperature; }
    public void setFeelsLikeTemperature(Double feelsLikeTemperature) { this.feelsLikeTemperature = feelsLikeTemperature; }
    public Double getRelativeHumidity() { return relativeHumidity; }
    public void setRelativeHumidity(Double relativeHumidity) { this.relativeHumidity = relativeHumidity; }
    public Integer getWeatherCode() { return weatherCode; }
    public void setWeatherCode(Integer weatherCode) { this.weatherCode = weatherCode; }
    public Double getCloudCover() { return cloudCover; }
    public void setCloudCover(Double cloudCover) { this.cloudCover = cloudCover; }
    public Double getRain() { return rain; }
    public void setRain(Double rain) { this.rain = rain; }
    public Double getPrecipitation() { return precipitation; }
    public void setPrecipitation(Double precipitation) { this.precipitation = precipitation; }
    public Double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }
    public Double getWindDirection() { return windDirection; }
    public void setWindDirection(Double windDirection) { this.windDirection = windDirection; }
    public Integer getIsDay() { return isDay; }
    public void setIsDay(Integer isDay) { this.isDay = isDay; }
}
