package com.farmersportal.serviceImpl;

import com.farmersportal.dto.CommodityDTO;
import com.farmersportal.dto.MandiPricesResponseDTO;
import com.farmersportal.dto.MarketPriceDTO;
import com.farmersportal.entity.MarketPriceCache;
import com.farmersportal.repository.MarketPriceCacheRepository;
import com.farmersportal.service.MarketPriceService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@SuppressWarnings({"unchecked", "null"})
public class MarketPriceServiceImpl implements MarketPriceService {

    private static final Logger log = LoggerFactory.getLogger(MarketPriceServiceImpl.class);

    private final MarketPriceCacheRepository marketPriceCacheRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gov.api.url}")
    private String govApiUrl;

    @Value("${gov.api.key}")
    private String govApiKey;

    @Value("${app.api.timeout-ms:15000}")
    private int apiTimeoutMs;

    // Constructor Injection
    public MarketPriceServiceImpl(MarketPriceCacheRepository marketPriceCacheRepository) {
        this.marketPriceCacheRepository = marketPriceCacheRepository;
    }

    @PostConstruct
    public void initSeedData() {
        // Configure restTemplate timeouts
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(apiTimeoutMs);
        requestFactory.setReadTimeout(apiTimeoutMs);
        restTemplate.setRequestFactory(requestFactory);

        // Pre-seed database if empty to guarantee out-of-the-box function
        if (marketPriceCacheRepository.count() == 0) {
            log.info("Pre-seeding database cache with default mandi price records...");
            String todayStr = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
            List<MarketPriceCache> seedData = Arrays.asList(
                    new MarketPriceCache(null, "Wheat", "Salem Mandi", "Salem", "Tamil Nadu", todayStr, 2350.0, 2490.0, 2425.0, "₹/Quintal", LocalDateTime.now()),
                    new MarketPriceCache(null, "Rice", "Nashik APMC", "Nashik", "Maharashtra", todayStr, 3100.0, 3400.0, 3250.0, "₹/Quintal", LocalDateTime.now()),
                    new MarketPriceCache(null, "Tomato", "Pune APMC Market", "Pune", "Maharashtra", todayStr, 1200.0, 2200.0, 1700.0, "₹/Quintal", LocalDateTime.now()),
                    new MarketPriceCache(null, "Onion", "Lasalgaon Mandi", "Nashik", "Maharashtra", todayStr, 800.0, 1400.0, 1100.0, "₹/Quintal", LocalDateTime.now()),
                    new MarketPriceCache(null, "Wheat", "Ludhiana Grain Market", "Ludhiana", "Punjab", todayStr, 2100.0, 2280.0, 2190.0, "₹/Quintal", LocalDateTime.now()),
                    new MarketPriceCache(null, "Mustard", "Jaipur Mandi", "Jaipur", "Rajasthan", todayStr, 4800.0, 5200.0, 5000.0, "₹/Quintal", LocalDateTime.now()),
                    new MarketPriceCache(null, "Soybean", "Indore Krishi Upaj Mandi", "Indore", "Madhya Pradesh", todayStr, 4200.0, 4600.0, 4400.0, "₹/Quintal", LocalDateTime.now()),
                    new MarketPriceCache(null, "Cotton", "Amritsar Central Mandi", "Amritsar", "Punjab", todayStr, 6200.0, 6800.0, 6500.0, "₹/Quintal", LocalDateTime.now())
            );
            marketPriceCacheRepository.saveAll(seedData);
            log.info("Database cache pre-seeded successfully.");
        }
    }

    @Override
    public MandiPricesResponseDTO getMandiPrices(String commodity, String state, String district, String market, String date) {
        long startTime = System.currentTimeMillis();
        log.info("Received mandi prices request: commodity={}, state={}, district={}, market={}", commodity, state, district, market);

        // If API key is not configured or is set to default template, bypass live call and serve from db cache immediately
        if (govApiKey == null || govApiKey.isBlank() || "YOUR_API_KEY".equals(govApiKey)) {
            log.info("Government API key not set or placeholder. Serving from database cache directly.");
            return fetchFromDatabaseCache(commodity, state, district, market, startTime, true);
        }

        try {
            // Build dynamic filters for the Agmarknet API
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(govApiUrl)
                    .queryParam("api-key", govApiKey)
                    .queryParam("format", "json")
                    .queryParam("limit", 100);

            if (commodity != null && !commodity.isBlank()) {
                builder.queryParam("filters[commodity]", commodity);
            }
            if (state != null && !state.isBlank()) {
                builder.queryParam("filters[state]", state);
            }
            if (district != null && !district.isBlank()) {
                builder.queryParam("filters[district]", district);
            }
            if (market != null && !market.isBlank()) {
                builder.queryParam("filters[market]", market);
            }

            String url = builder.toUriString();
            log.debug("Calling government API: {}", url.replaceAll("api-key=[^&]+", "api-key=REDACTED"));

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            long duration = System.currentTimeMillis() - startTime;
            log.info("Agmarknet API responded successfully in {} ms", duration);

            if (response != null && response.containsKey("records")) {
                List<Map<String, Object>> records = (List<Map<String, Object>>) response.get("records");
                
                if (!records.isEmpty()) {
                    List<MarketPriceCache> entities = records.stream()
                            .map(this::mapRecordToEntity)
                            .collect(Collectors.toList());

                    // Save elements to DB cache
                    marketPriceCacheRepository.saveAll(entities);
                    
                    List<MarketPriceDTO> dtos = entities.stream()
                            .map(this::mapToDTO)
                            .collect(Collectors.toList());

                    return MandiPricesResponseDTO.builder()
                            .data(dtos)
                            .isCached(false)
                            .lastUpdated(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                            .build();
                }
            }
            
            // If API returned empty records, try cache
            log.warn("Agmarknet API returned zero records. Falling back to DB cache.");
            return fetchFromDatabaseCache(commodity, state, district, market, startTime, true);

        } catch (Exception e) {
            log.error("Failed to fetch live mandi prices from Government API: {}. Falling back to DB cache.", e.getMessage());
            return fetchFromDatabaseCache(commodity, state, district, market, startTime, true);
        }
    }

    @Override
    public List<MarketPriceDTO> getMandiPricesListOnly(String commodity, String state, String district) {
        log.info("Fetching filtered mandi price list for state={}, district={}, commodity={}", state, district, commodity);
        List<MarketPriceCache> cached = marketPriceCacheRepository.findFilteredPrices(commodity, state, district, null);
        return cached.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private MandiPricesResponseDTO fetchFromDatabaseCache(String commodity, String state, String district, String market, long startTime, boolean isStale) {
        List<MarketPriceCache> cachedData = marketPriceCacheRepository.findFilteredPrices(commodity, state, district, market);
        
        // If DB has no records for the specific combination, pull all cached records so UI has data to display
        if (cachedData.isEmpty()) {
            cachedData = marketPriceCacheRepository.findAll();
        }

        List<MarketPriceDTO> dtos = cachedData.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        String lastUpdated = cachedData.isEmpty() 
                ? LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) 
                : cachedData.get(0).getCachedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        long duration = System.currentTimeMillis() - startTime;
        log.info("Served cached mandi data in {} ms (records count={})", duration, dtos.size());

        return MandiPricesResponseDTO.builder()
                .data(dtos)
                .isCached(isStale)
                .lastUpdated(lastUpdated)
                .build();
    }

    @Override
    public List<CommodityDTO> getCommodities() {
        return Arrays.asList(
                new CommodityDTO("WHEAT", "Wheat"),
                new CommodityDTO("RICE", "Rice"),
                new CommodityDTO("MAIZE", "Maize"),
                new CommodityDTO("TOMATO", "Tomato"),
                new CommodityDTO("ONION", "Onion"),
                new CommodityDTO("POTATO", "Potato"),
                new CommodityDTO("SOYBEAN", "Soybean"),
                new CommodityDTO("COTTON", "Cotton"),
                new CommodityDTO("SUGARCANE", "Sugarcane"),
                new CommodityDTO("MUSTARD", "Mustard"),
                new CommodityDTO("GROUNDNUT", "Groundnut"),
                new CommodityDTO("CHILLI", "Chilli")
        );
    }

    @Override
    public List<String> getStates() {
        return marketPriceCacheRepository.findDistinctStates();
    }

    @Override
    public List<String> getDistricts(String state) {
        return marketPriceCacheRepository.findDistinctDistrictsByState(state);
    }

    @Override
    public List<String> getMarkets(String district) {
        return marketPriceCacheRepository.findDistinctMarketsByDistrict(district);
    }

    @Override
    public void refreshMandiPricesCache() {
        log.info("Executing scheduled mandi prices cache refresh...");
        if (govApiKey == null || govApiKey.isBlank() || "YOUR_API_KEY".equals(govApiKey)) {
            log.info("API Key not set. Scheduled refresh skipped.");
            return;
        }

        try {
            // Trigger a general refresh fetch
            String url = UriComponentsBuilder.fromUriString(govApiUrl)
                    .queryParam("api-key", govApiKey)
                    .queryParam("format", "json")
                    .queryParam("limit", 100)
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("records")) {
                List<Map<String, Object>> records = (List<Map<String, Object>>) response.get("records");
                if (!records.isEmpty()) {
                    List<MarketPriceCache> entities = records.stream()
                            .map(this::mapRecordToEntity)
                            .collect(Collectors.toList());
                    marketPriceCacheRepository.saveAll(entities);
                    log.info("Scheduled mandi prices cache refresh completed. Cached {} records.", entities.size());
                    return;
                }
            }
            log.warn("Scheduled refresh returned empty data.");
        } catch (Exception e) {
            log.error("Scheduled mandi prices refresh failed: {}", e.getMessage());
        }
    }

    private MarketPriceCache mapRecordToEntity(Map<String, Object> record) {
        return MarketPriceCache.builder()
                .commodity(String.valueOf(record.getOrDefault("commodity", "")))
                .market(String.valueOf(record.getOrDefault("market", "")))
                .district(String.valueOf(record.getOrDefault("district", "")))
                .state(String.valueOf(record.getOrDefault("state", "")))
                .arrivalDate(String.valueOf(record.getOrDefault("arrival_date", LocalDate.now().toString())))
                .minimumPrice(parseDouble(record.get("min_price")))
                .maximumPrice(parseDouble(record.get("max_price")))
                .modalPrice(parseDouble(record.get("modal_price")))
                .unit("₹/Quintal")
                .cachedAt(LocalDateTime.now())
                .build();
    }

    private MarketPriceDTO mapToDTO(MarketPriceCache entity) {
        return MarketPriceDTO.builder()
                .commodity(entity.getCommodity())
                .market(entity.getMarket())
                .district(entity.getDistrict())
                .state(entity.getState())
                .arrivalDate(entity.getArrivalDate())
                .minimumPrice(entity.getMinimumPrice())
                .maximumPrice(entity.getMaximumPrice())
                .modalPrice(entity.getModalPrice())
                .unit(entity.getUnit())
                .build();
    }

    private Double parseDouble(Object val) {
        if (val == null) return 0.0;
        try {
            return Double.parseDouble(String.valueOf(val));
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
