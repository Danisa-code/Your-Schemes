package com.farmersportal.controller;

import com.farmersportal.dto.WeatherResponseDTO;
import com.farmersportal.exception.ValidationException;
import com.farmersportal.service.WeatherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class WeatherController {

    private static final Logger log = LoggerFactory.getLogger(WeatherController.class);

    private final WeatherService weatherService;

    // Constructor Injection
    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/weather")
    public ResponseEntity<WeatherResponseDTO> getWeather(
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude) {

        log.info("API request: GET /api/weather latitude={}, longitude={}", latitude, longitude);
        validateCoordinates(latitude, longitude);

        WeatherResponseDTO weather = weatherService.getWeather(latitude, longitude);
        return ResponseEntity.ok(weather);
    }

    private void validateCoordinates(Double latitude, Double longitude) {
        if (latitude == null) {
            throw new ValidationException("Latitude parameter is required.");
        }
        if (longitude == null) {
            throw new ValidationException("Longitude parameter is required.");
        }
        if (latitude < -90.0 || latitude > 90.0) {
            throw new ValidationException("Invalid latitude. Latitude must be between -90.0 and 90.0.");
        }
        if (longitude < -180.0 || longitude > 180.0) {
            throw new ValidationException("Invalid longitude. Longitude must be between -180.0 and 180.0.");
        }
    }
}
