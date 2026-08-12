package com.farmersportal.serviceImpl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.farmersportal.dto.ForecastDayDTO;
import com.farmersportal.dto.WeatherResponseDTO;
import com.farmersportal.dto.CurrentWeatherDTO;
import com.farmersportal.dto.HourlyForecastDTO;
import com.farmersportal.dto.DailyForecastDTO;
import com.farmersportal.entity.WeatherCache;
import com.farmersportal.repository.WeatherCacheRepository;
import com.farmersportal.service.WeatherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;

@Service
@SuppressWarnings("unchecked")
public class WeatherServiceImpl implements WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherServiceImpl.class);

    private final WeatherCacheRepository weatherCacheRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Constructor Injection
    public WeatherServiceImpl(WeatherCacheRepository weatherCacheRepository) {
        this.weatherCacheRepository = weatherCacheRepository;
    }

    @Override
    public WeatherResponseDTO getWeather(Double latitude, Double longitude) {
        long startTime = System.currentTimeMillis();
        log.info("Requesting weather forecast for lat={}, lon={}", latitude, longitude);

        // Configure timeouts
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(10000);
        requestFactory.setReadTimeout(10000);
        restTemplate.setRequestFactory(requestFactory);

        try {
            // Build Open-Meteo API query url with advanced metrics
            String url = UriComponentsBuilder.fromUriString("https://api.open-meteo.com/v1/forecast")
                    .queryParam("latitude", latitude)
                    .queryParam("longitude", longitude)
                    .queryParam("current", "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,cloud_cover,rain,precipitation,wind_speed_10m,wind_direction_10m,is_day")
                    .queryParam("hourly", "temperature_2m,rain,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,visibility,uv_index,relative_humidity_2m,apparent_temperature")
                    .queryParam("daily", "temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,rain_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,uv_index_max,sunrise,sunset,daylight_duration,sunshine_duration")
                    .queryParam("timezone", "auto")
                    .queryParam("models", "best_match")
                    .toUriString();

            log.debug("Calling Open-Meteo API: {}", url);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            long duration = System.currentTimeMillis() - startTime;
            log.info("Open-Meteo API responded successfully in {} ms", duration);

            if (response != null) {
                // Map API response to DTO
                WeatherResponseDTO dto = parseOpenMeteoResponse(response);

                // Save to DB cache
                saveToWeatherCache(latitude, longitude, dto);

                return dto;
            }
            
            throw new RuntimeException("Open-Meteo API returned empty response");
            
        } catch (Exception e) {
            log.error("Failed to fetch live weather details: {}. Checking DB Cache.", e.getMessage());
            return fetchFromWeatherCache(latitude, longitude, startTime);
        }
    }

    private WeatherResponseDTO fetchFromWeatherCache(Double latitude, Double longitude, long startTime) {
        // Look for exact match or closest coordinate in cache (within 0.1 degree tolerance)
        List<WeatherCache> cacheList = weatherCacheRepository.findAll();
        Optional<WeatherCache> cached = cacheList.stream()
                .filter(c -> Math.abs(c.getLatitude() - latitude) < 0.15 && Math.abs(c.getLongitude() - longitude) < 0.15)
                .findFirst();

        if (cached.isPresent()) {
            WeatherCache cache = cached.get();
            log.info("Found cached weather record inside DB. Lat={}, Lon={}", cache.getLatitude(), cache.getLongitude());
            
            try {
                // Attempt to deserialize the entire WeatherResponseDTO structure
                WeatherResponseDTO cachedDto = objectMapper.readValue(cache.getForecastJson(), WeatherResponseDTO.class);
                long duration = System.currentTimeMillis() - startTime;
                log.info("Served cached weather data in {} ms", duration);
                return cachedDto;
            } catch (Exception e) {
                log.warn("Failed to deserialize forecastJson as WeatherResponseDTO. Falling back to legacy list.");
                try {
                    List<ForecastDayDTO> forecastList = objectMapper.readValue(cache.getForecastJson(), new TypeReference<List<ForecastDayDTO>>() {});
                    long duration = System.currentTimeMillis() - startTime;
                    log.info("Served cached legacy weather data in {} ms", duration);
                    return WeatherResponseDTO.builder()
                            .temperature(cache.getTemperature())
                            .humidity(cache.getHumidity())
                            .windSpeed(cache.getWindSpeed())
                            .rainProbability(cache.getRainProbability())
                            .forecast(forecastList)
                            .build();
                } catch (Exception ex) {
                    log.error("Failed to parse forecast JSON with legacy fallback: {}", ex.getMessage());
                }
            }
        }

        // Final out-of-the-box fallback (Nashik default)
        log.warn("No weather cache record found in database. Returning pre-seeded Nashik default weather.");
        List<ForecastDayDTO> defaultForecast = Arrays.asList(
                new ForecastDayDTO("Mon", "31°C / 22°C", "78%", "Partly Cloudy", "partly_cloudy_day", "20%"),
                new ForecastDayDTO("Tue", "30°C / 21°C", "82%", "Scattered Showers", "rainy", "60%"),
                new ForecastDayDTO("Wed", "29°C / 21°C", "88%", "Thunderstorms Expected", "thunderstorm", "90%"),
                new ForecastDayDTO("Thu", "31°C / 22°C", "80%", "Partly Cloudy", "partly_cloudy_day", "30%"),
                new ForecastDayDTO("Fri", "32°C / 23°C", "75%", "Sunny & Clear Sky", "wb_sunny", "10%")
        );

        return WeatherResponseDTO.builder()
                .temperature(28.0)
                .humidity(42.0)
                .windSpeed(12.0)
                .rainProbability(0.0)
                .forecast(defaultForecast)
                .build();
    }

    private void saveToWeatherCache(Double latitude, Double longitude, WeatherResponseDTO dto) {
        try {
            // Find existing record to overwrite
            Optional<WeatherCache> existing = weatherCacheRepository.findByLatitudeAndLongitude(latitude, longitude);
            WeatherCache entity = existing.orElseGet(() -> WeatherCache.builder()
                    .latitude(latitude)
                    .longitude(longitude)
                    .build());

            entity.setTemperature(dto.getTemperature());
            entity.setHumidity(dto.getHumidity());
            entity.setWindSpeed(dto.getWindSpeed());
            entity.setRainProbability(dto.getRainProbability());
            
            // Extract weather code from current forecast if available
            entity.setWeatherCode(dto.getCurrent() != null ? dto.getCurrent().getWeatherCode() : 0);
            entity.setForecastJson(objectMapper.writeValueAsString(dto));
            entity.setCachedAt(LocalDateTime.now());

            weatherCacheRepository.save(entity);
            log.debug("Successfully saved weather report for lat={}, lon={} to DB cache.", latitude, longitude);
        } catch (Exception e) {
            log.error("Failed to write weather details to database cache: {}", e.getMessage());
        }
    }

    private WeatherResponseDTO parseOpenMeteoResponse(Map<String, Object> response) {
        Map<String, Object> currentMap = (Map<String, Object>) response.get("current");
        Map<String, Object> hourlyMap = (Map<String, Object>) response.get("hourly");
        Map<String, Object> dailyMap = (Map<String, Object>) response.get("daily");

        // 1. Current Weather
        Double currentTemp = parseDouble(currentMap.get("temperature_2m"));
        Double feelsLike = parseDouble(currentMap.get("apparent_temperature"));
        Double currentHumidity = parseDouble(currentMap.get("relative_humidity_2m"));
        Integer currentCode = parseInteger(currentMap.get("weather_code"));
        Double cloud = parseDouble(currentMap.get("cloud_cover"));
        Double rainVal = parseDouble(currentMap.get("rain"));
        Double precip = parseDouble(currentMap.get("precipitation"));
        Double currentWindSpeed = parseDouble(currentMap.get("wind_speed_10m"));
        Double currentWindDirection = parseDouble(currentMap.get("wind_direction_10m"));
        Integer isDayVal = parseInteger(currentMap.get("is_day"));

        CurrentWeatherDTO currentDTO = CurrentWeatherDTO.builder()
                .temperature(currentTemp)
                .feelsLikeTemperature(feelsLike)
                .relativeHumidity(currentHumidity)
                .weatherCode(currentCode)
                .cloudCover(cloud)
                .rain(rainVal)
                .precipitation(precip)
                .windSpeed(currentWindSpeed)
                .windDirection(currentWindDirection)
                .isDay(isDayVal)
                .build();

        // 2. Hourly Forecast (fetch next 24 hours)
        List<HourlyForecastDTO> hourlyList = new ArrayList<>();
        if (hourlyMap != null) {
            List<String> times = (List<String>) hourlyMap.get("time");
            List<Double> temps = (List<Double>) hourlyMap.get("temperature_2m");
            List<Double> rains = (List<Double>) hourlyMap.get("rain");
            List<Double> probs = (List<Double>) hourlyMap.get("precipitation_probability");
            List<Double> precips = (List<Double>) hourlyMap.get("precipitation");
            List<Integer> codes = (List<Integer>) hourlyMap.get("weather_code");
            List<Double> windSpeeds = (List<Double>) hourlyMap.get("wind_speed_10m");
            List<Double> windDirs = (List<Double>) hourlyMap.get("wind_direction_10m");
            List<Double> clouds = (List<Double>) hourlyMap.get("cloud_cover");
            List<Double> visibilities = (List<Double>) hourlyMap.get("visibility");
            List<Double> uvs = (List<Double>) hourlyMap.get("uv_index");
            List<Double> humidities = (List<Double>) hourlyMap.get("relative_humidity_2m");
            List<Double> feelsLikes = (List<Double>) hourlyMap.get("apparent_temperature");

            if (times != null) {
                int limit = Math.min(times.size(), 24);
                for (int i = 0; i < limit; i++) {
                    hourlyList.add(HourlyForecastDTO.builder()
                            .time(times.get(i))
                            .temperature(getItem(temps, i, 0.0))
                            .rain(getItem(rains, i, 0.0))
                            .precipitationProbability(getItem(probs, i, 0.0))
                            .precipitation(getItem(precips, i, 0.0))
                            .weatherCode(getItem(codes, i, 0))
                            .windSpeed(getItem(windSpeeds, i, 0.0))
                            .windDirection(getItem(windDirs, i, 0.0))
                            .cloudCover(getItem(clouds, i, 0.0))
                            .visibility(getItem(visibilities, i, 0.0))
                            .uvIndex(getItem(uvs, i, 0.0))
                            .relativeHumidity(getItem(humidities, i, 0.0))
                            .feelsLikeTemperature(getItem(feelsLikes, i, 0.0))
                            .build());
                }
            }
        }

        // 3. Daily Forecast (7 Days)
        List<DailyForecastDTO> dailyList = new ArrayList<>();
        List<ForecastDayDTO> backwardForecastList = new ArrayList<>();
        
        if (dailyMap != null) {
            List<String> dates = (List<String>) dailyMap.get("time");
            List<Double> maxTemps = (List<Double>) dailyMap.get("temperature_2m_max");
            List<Double> minTemps = (List<Double>) dailyMap.get("temperature_2m_min");
            List<Double> appMaxs = (List<Double>) dailyMap.get("apparent_temperature_max");
            List<Double> appMins = (List<Double>) dailyMap.get("apparent_temperature_min");
            List<Double> rainSums = (List<Double>) dailyMap.get("rain_sum");
            List<Double> rainProbs = (List<Double>) dailyMap.get("precipitation_probability_max");
            List<Integer> codes = (List<Integer>) dailyMap.get("weather_code");
            List<Double> windMaxs = (List<Double>) dailyMap.get("wind_speed_10m_max");
            List<Double> uvMaxs = (List<Double>) dailyMap.get("uv_index_max");
            List<String> sunrises = (List<String>) dailyMap.get("sunrise");
            List<String> sunsets = (List<String>) dailyMap.get("sunset");
            List<Double> daylightDurs = (List<Double>) dailyMap.get("daylight_duration");
            List<Double> sunshineDurs = (List<Double>) dailyMap.get("sunshine_duration");

            if (dates != null) {
                int limit = Math.min(dates.size(), 7);
                for (int i = 0; i < limit; i++) {
                    String dateStr = dates.get(i);
                    Double maxT = getItem(maxTemps, i, 30.0);
                    Double minT = getItem(minTemps, i, 20.0);
                    Integer codeVal = getItem(codes, i, 0);
                    Double rainProbVal = getItem(rainProbs, i, 0.0);

                    // Daily forecast DTO
                    dailyList.add(DailyForecastDTO.builder()
                            .date(dateStr)
                            .maxTemperature(maxT)
                            .minTemperature(minT)
                            .apparentMaxTemperature(getItem(appMaxs, i, maxT))
                            .apparentMinTemperature(getItem(appMins, i, minT))
                            .totalRain(getItem(rainSums, i, 0.0))
                            .maxRainProbability(rainProbVal)
                            .weatherCode(codeVal)
                            .maxWindSpeed(getItem(windMaxs, i, 0.0))
                            .maxUvIndex(getItem(uvMaxs, i, 0.0))
                            .sunrise(getItem(sunrises, i, ""))
                            .sunset(getItem(sunsets, i, ""))
                            .daylightDuration(getItem(daylightDurs, i, 0.0))
                            .sunshineDuration(getItem(sunshineDurs, i, 0.0))
                            .build());

                    // Populate legacy forecast list for backward compatibility
                    LocalDate localDate = LocalDate.parse(dateStr);
                    String dayName = localDate.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                    backwardForecastList.add(ForecastDayDTO.builder()
                            .day(dayName)
                            .temp(String.format("%.0f°C / %.0f°C", maxT, minT))
                            .humidity("75%")
                            .condition(getWeatherConditionByCode(codeVal))
                            .icon(getWeatherIconByCode(codeVal))
                            .rainChance(String.format("%.0f%%", rainProbVal))
                            .build());
                }
            }
        }

        // Return unified response DTO
        // Default legacy properties to current values for safety
        Double rainChanceMax = (dailyList.isEmpty()) ? 0.0 : dailyList.get(0).getMaxRainProbability();
        return WeatherResponseDTO.builder()
                .temperature(currentTemp)
                .humidity(currentHumidity)
                .windSpeed(currentWindSpeed)
                .rainProbability(rainChanceMax)
                .forecast(backwardForecastList)
                .current(currentDTO)
                .hourly(hourlyList)
                .daily(dailyList)
                .build();
    }

    private String getWeatherConditionByCode(int code) {
        if (code == 0) return "Sunny & Clear Sky";
        if (code == 1 || code == 2 || code == 3) return "Partly Cloudy";
        if (code == 45 || code == 48) return "Foggy Weather";
        if (code >= 51 && code <= 55) return "Light Drizzle";
        if (code >= 61 && code <= 65) return "Continuous Rain";
        if (code >= 80 && code <= 82) return "Heavy Showers";
        if (code >= 95 && code <= 99) return "Thunderstorms Expected";
        return "Scattered Clouds";
    }

    private String getWeatherIconByCode(int code) {
        if (code == 0) return "wb_sunny";
        if (code == 1 || code == 2 || code == 3) return "partly_cloudy_day";
        if (code == 45 || code == 48) return "foggy";
        if (code >= 51 && code <= 65) return "rainy";
        if (code >= 80 && code <= 82) return "rainy";
        if (code >= 95 && code <= 99) return "thunderstorm";
        return "cloud";
    }

    @Override
    public void refreshWeatherCache() {
        log.info("Executing scheduled weather cache refresh for all coordinates stored...");
        List<WeatherCache> allCaches = weatherCacheRepository.findAll();
        for (WeatherCache cache : allCaches) {
            try {
                getWeather(cache.getLatitude(), cache.getLongitude());
            } catch (Exception e) {
                log.error("Failed to refresh weather cache for lat={}, lon={}: {}", cache.getLatitude(), cache.getLongitude(), e.getMessage());
            }
        }
        log.info("Scheduled weather cache refresh completed.");
    }

    private <T> T getItem(List<T> list, int index, T fallback) {
        if (list == null || index < 0 || index >= list.size()) {
            return fallback;
        }
        T val = list.get(index);
        return val != null ? val : fallback;
    }

    private Double parseDouble(Object val) {
        if (val == null) return 0.0;
        try {
            return Double.parseDouble(String.valueOf(val));
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private Integer parseInteger(Object val) {
        if (val == null) return 0;
        try {
            return Integer.parseInt(String.valueOf(val));
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
