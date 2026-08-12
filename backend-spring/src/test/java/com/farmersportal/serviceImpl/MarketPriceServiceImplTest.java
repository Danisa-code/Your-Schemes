package com.farmersportal.serviceImpl;

import com.farmersportal.dto.MandiPricesResponseDTO;
import com.farmersportal.service.MarketPriceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class MarketPriceServiceImplTest {

    @Autowired
    private MarketPriceService marketPriceService;

    @Test
    public void testGetMandiPricesLiveAPI() {
        // Retrieve mandi prices using the live API
        MandiPricesResponseDTO response = marketPriceService.getMandiPrices(null, null, null, null, null);

        // Verify that we got a valid response
        assertNotNull(response);
        assertNotNull(response.getData());
        
        // Since we are running the test with a live API key, let's log the details
        System.out.println("--- LIVE MANDI PRICES TEST ---");
        System.out.println("Is Cached: " + response.isCached());
        System.out.println("Last Updated: " + response.getLastUpdated());
        System.out.println("Records returned: " + response.getData().size());
        
        if (!response.getData().isEmpty()) {
            System.out.println("First record commodity: " + response.getData().get(0).getCommodity());
            System.out.println("First record state: " + response.getData().get(0).getState());
            System.out.println("First record min price: " + response.getData().get(0).getMinimumPrice());
            System.out.println("First record max price: " + response.getData().get(0).getMaximumPrice());
            System.out.println("First record modal price: " + response.getData().get(0).getModalPrice());
        }
        
        // Since the key is valid, we should get some live data or fallback gracefully to cache.
        // We assert that the response structure is correct.
        assertFalse(response.getData().isEmpty(), "Mandi data should not be empty!");
    }
}
