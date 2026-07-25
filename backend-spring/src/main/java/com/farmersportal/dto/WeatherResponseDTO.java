package com.farmersportal.dto;

import java.util.List;

public class WeatherResponseDTO {
    private Double temperature;
    private Double humidity;
    private Double windSpeed;
    private Double rainProbability;
    private List<ForecastDayDTO> forecast;
    
    // Extended properties
    private CurrentWeatherDTO current;
    private List<HourlyForecastDTO> hourly;
    private List<DailyForecastDTO> daily;

    public WeatherResponseDTO() {}

    public WeatherResponseDTO(Double temperature, Double humidity, Double windSpeed, Double rainProbability, List<ForecastDayDTO> forecast) {
        this.temperature = temperature;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.rainProbability = rainProbability;
        this.forecast = forecast;
    }

    public WeatherResponseDTO(Double temperature, Double humidity, Double windSpeed, Double rainProbability, List<ForecastDayDTO> forecast, CurrentWeatherDTO current, List<HourlyForecastDTO> hourly, List<DailyForecastDTO> daily) {
        this.temperature = temperature;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.rainProbability = rainProbability;
        this.forecast = forecast;
        this.current = current;
        this.hourly = hourly;
        this.daily = daily;
    }

    public static WeatherResponseDTOBuilder builder() {
        return new WeatherResponseDTOBuilder();
    }

    // Getters and Setters
    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }
    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }
    public Double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }
    public Double getRainProbability() { return rainProbability; }
    public void setRainProbability(Double rainProbability) { this.rainProbability = rainProbability; }
    public List<ForecastDayDTO> getForecast() { return forecast; }
    public void setForecast(List<ForecastDayDTO> forecast) { this.forecast = forecast; }

    public CurrentWeatherDTO getCurrent() { return current; }
    public void setCurrent(CurrentWeatherDTO current) { this.current = current; }
    public List<HourlyForecastDTO> getHourly() { return hourly; }
    public void setHourly(List<HourlyForecastDTO> hourly) { this.hourly = hourly; }
    public List<DailyForecastDTO> getDaily() { return daily; }
    public void setDaily(List<DailyForecastDTO> daily) { this.daily = daily; }

    public static class WeatherResponseDTOBuilder {
        private Double temperature;
        private Double humidity;
        private Double windSpeed;
        private Double rainProbability;
        private List<ForecastDayDTO> forecast;
        private CurrentWeatherDTO current;
        private List<HourlyForecastDTO> hourly;
        private List<DailyForecastDTO> daily;

        WeatherResponseDTOBuilder() {}

        public WeatherResponseDTOBuilder temperature(Double temperature) { this.temperature = temperature; return this; }
        public WeatherResponseDTOBuilder humidity(Double humidity) { this.humidity = humidity; return this; }
        public WeatherResponseDTOBuilder windSpeed(Double windSpeed) { this.windSpeed = windSpeed; return this; }
        public WeatherResponseDTOBuilder rainProbability(Double rainProbability) { this.rainProbability = rainProbability; return this; }
        public WeatherResponseDTOBuilder forecast(List<ForecastDayDTO> forecast) { this.forecast = forecast; return this; }
        public WeatherResponseDTOBuilder current(CurrentWeatherDTO current) { this.current = current; return this; }
        public WeatherResponseDTOBuilder hourly(List<HourlyForecastDTO> hourly) { this.hourly = hourly; return this; }
        public WeatherResponseDTOBuilder daily(List<DailyForecastDTO> daily) { this.daily = daily; return this; }

        public WeatherResponseDTO build() {
            return new WeatherResponseDTO(temperature, humidity, windSpeed, rainProbability, forecast, current, hourly, daily);
        }
    }
}
