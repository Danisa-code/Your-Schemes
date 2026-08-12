
package com.farmersportal.scheduler;

import com.farmersportal.service.MarketPriceService;
import com.farmersportal.service.WeatherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CacheRefreshScheduler {

    private static final Logger log = LoggerFactory.getLogger(CacheRefreshScheduler.class);

    private final MarketPriceService marketPriceService;
    private final WeatherService weatherService;

    // Constructor Injection
    public CacheRefreshScheduler(MarketPriceService marketPriceService, WeatherService weatherService) {
        this.marketPriceService = marketPriceService;
        this.weatherService = weatherService;
    }

    // Refresh every 30 minutes (30 * 60 * 1000 = 1800000 ms)
    @Scheduled(fixedRateString = "${app.cache.refresh-rate-ms:1800000}")
    public void refreshCaches() {
        log.info("Starting automatic background cache refresh scheduler execution...");
        
        long startTime = System.currentTimeMillis();
        
        // 1. Refresh Mandi Prices Cache
        try {
            marketPriceService.refreshMandiPricesCache();
        } catch (Exception e) {
            log.error("Error during scheduled Mandi Prices Cache refresh: {}", e.getMessage());
        }

        // 2. Refresh Weather Cache
        try {
            weatherService.refreshWeatherCache();
        } catch (Exception e) {
            log.error("Error during scheduled Weather Cache refresh: {}", e.getMessage());
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("Automatic cache refresh completed in {} ms.", duration);
    }
}
