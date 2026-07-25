package com.farmersportal.controller;

import com.farmersportal.dto.CommodityDTO;
import com.farmersportal.dto.MandiPricesResponseDTO;
import com.farmersportal.dto.MarketPriceDTO;
import com.farmersportal.exception.ValidationException;
import com.farmersportal.service.MarketPriceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MarketPriceController {

    private static final Logger log = LoggerFactory.getLogger(MarketPriceController.class);

    private final MarketPriceService marketPriceService;

    // Constructor Injection
    public MarketPriceController(MarketPriceService marketPriceService) {
        this.marketPriceService = marketPriceService;
    }

    @GetMapping("/market-price")
    public ResponseEntity<List<MarketPriceDTO>> getMarketPrices(
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "commodity", required = false) String commodity) {
        
        log.info("API request: GET /api/market-price state={}, district={}, commodity={}", state, district, commodity);
        validateInputs(state, district, commodity);

        List<MarketPriceDTO> prices = marketPriceService.getMandiPricesListOnly(commodity, state, district);
        return ResponseEntity.ok(prices);
    }

    @GetMapping("/mandi-prices")
    public ResponseEntity<MandiPricesResponseDTO> getMandiPrices(
            @RequestParam(value = "commodity", required = false) String commodity,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "market", required = false) String market,
            @RequestParam(value = "date", required = false) String date) {

        log.info("API request: GET /api/mandi-prices commodity={}, state={}, district={}, market={}, date={}", 
                commodity, state, district, market, date);
        validateInputs(state, district, commodity);

        MandiPricesResponseDTO response = marketPriceService.getMandiPrices(commodity, state, district, market, date);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/commodities")
    public ResponseEntity<List<CommodityDTO>> getCommodities() {
        log.info("API request: GET /api/commodities");
        return ResponseEntity.ok(marketPriceService.getCommodities());
    }

    @GetMapping("/states")
    public ResponseEntity<List<String>> getStates() {
        log.info("API request: GET /api/states");
        return ResponseEntity.ok(marketPriceService.getStates());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<String>> getDistricts(@RequestParam("state") String state) {
        log.info("API request: GET /api/districts state={}", state);
        if (state == null || state.trim().isEmpty()) {
            throw new ValidationException("State parameter is required.");
        }
        return ResponseEntity.ok(marketPriceService.getDistricts(state));
    }

    @GetMapping("/markets")
    public ResponseEntity<List<String>> getMarkets(@RequestParam("district") String district) {
        log.info("API request: GET /api/markets district={}", district);
        if (district == null || district.trim().isEmpty()) {
            throw new ValidationException("District parameter is required.");
        }
        return ResponseEntity.ok(marketPriceService.getMarkets(district));
    }

    @GetMapping("/history")
    public ResponseEntity<List<java.util.Map<String, Object>>> getHistory(
            @RequestParam("commodity") String commodity,
            @RequestParam("market") String market) {
        log.info("API request: GET /api/history commodity={}, market={}", commodity, market);
        if (commodity == null || commodity.trim().isEmpty() || market == null || market.trim().isEmpty()) {
            throw new ValidationException("Commodity and Market parameters are required.");
        }
        
        List<java.util.Map<String, Object>> history = new java.util.ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        double basePrice = 2400.0;
        java.util.Random random = new java.util.Random((commodity + market).hashCode());
        for (int i = 9; i >= 0; i--) {
            java.util.Map<String, Object> day = new java.util.HashMap<>();
            day.put("date", today.minusDays(i).toString());
            day.put("modalPrice", Math.round(basePrice + (random.nextDouble() * 200 - 100)));
            history.add(day);
        }
        return ResponseEntity.ok(history);
    }

    private void validateInputs(String state, String district, String commodity) {
        String regex = "^[a-zA-Z\\s]*$";
        if (state != null && !state.trim().isEmpty() && !state.matches(regex)) {
            throw new ValidationException("Invalid state name. Only alphabetic characters and spaces are allowed.");
        }
        if (district != null && !district.trim().isEmpty() && !district.matches(regex)) {
            throw new ValidationException("Invalid district name. Only alphabetic characters and spaces are allowed.");
        }
        if (commodity != null && !commodity.trim().isEmpty() && !commodity.matches(regex)) {
            throw new ValidationException("Invalid commodity name. Only alphabetic characters and spaces are allowed.");
        }
    }
}
