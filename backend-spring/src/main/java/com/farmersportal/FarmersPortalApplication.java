package com.farmersportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FarmersPortalApplication {
    public static void main(String[] args) {
        SpringApplication.run(FarmersPortalApplication.class, args);
    }
}
