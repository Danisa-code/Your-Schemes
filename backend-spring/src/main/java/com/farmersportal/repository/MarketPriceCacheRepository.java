package com.farmersportal.repository;

import com.farmersportal.entity.MarketPriceCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MarketPriceCacheRepository extends JpaRepository<MarketPriceCache, Long> {

    @Query("SELECT DISTINCT m.commodity FROM MarketPriceCache m")
    List<String> findDistinctCommodities();

    @Query("SELECT DISTINCT m.state FROM MarketPriceCache m")
    List<String> findDistinctStates();

    @Query("SELECT DISTINCT m.district FROM MarketPriceCache m WHERE m.state = :state")
    List<String> findDistinctDistrictsByState(@Param("state") String state);

    @Query("SELECT DISTINCT m.market FROM MarketPriceCache m WHERE m.district = :district")
    List<String> findDistinctMarketsByDistrict(@Param("district") String district);

    @Query("SELECT m FROM MarketPriceCache m WHERE " +
           "(:commodity IS NULL OR LOWER(m.commodity) = LOWER(:commodity)) AND " +
           "(:state IS NULL OR m.state = :state) AND " +
           "(:district IS NULL OR m.district = :district) AND " +
           "(:market IS NULL OR m.market = :market)")
    List<MarketPriceCache> findFilteredPrices(
            @Param("commodity") String commodity,
            @Param("state") String state,
            @Param("district") String district,
            @Param("market") String market
    );
}
