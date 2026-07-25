package com.farmersportal.service;

import com.farmersportal.dto.CommodityDTO;
import com.farmersportal.dto.MandiPricesResponseDTO;
import com.farmersportal.dto.MarketPriceDTO;
import java.util.List;

public interface MarketPriceService {
    MandiPricesResponseDTO getMandiPrices(String commodity, String state, String district, String market, String date);
    List<CommodityDTO> getCommodities();
    List<String> getStates();
    List<String> getDistricts(String state);
    List<String> getMarkets(String district);
    List<MarketPriceDTO> getMandiPricesListOnly(String commodity, String state, String district);
    void refreshMandiPricesCache();
}
