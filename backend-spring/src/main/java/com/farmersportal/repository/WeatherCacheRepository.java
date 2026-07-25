package com.farmersportal.repository;

import com.farmersportal.entity.WeatherCache;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WeatherCacheRepository extends JpaRepository<WeatherCache, Long> {
    Optional<WeatherCache> findByLatitudeAndLongitude(Double latitude, Double longitude);
}
