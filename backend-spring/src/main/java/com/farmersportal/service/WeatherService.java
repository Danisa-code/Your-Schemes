package com.farmersportal.service;

import com.farmersportal.dto.WeatherResponseDTO;

public interface WeatherService {
    WeatherResponseDTO getWeather(Double latitude, Double longitude);
    void refreshWeatherCache();
}
