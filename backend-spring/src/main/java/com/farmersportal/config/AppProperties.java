package com.farmersportal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

public class AppProperties {

    @Configuration
    @ConfigurationProperties(prefix = "gov")
    public static class GovProperties {
        private String apiUrl;
        private String apiKey;

        public String getApiUrl() { return apiUrl; }
        public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    }

    @Configuration
    @ConfigurationProperties(prefix = "supabase")
    public static class SupabaseProperties {
        private String url;
        private String key;

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
    }

    @Configuration
    @ConfigurationProperties(prefix = "app")
    public static class CustomProperties {
        private final Cache cache = new Cache();
        private final Api api = new Api();

        public Cache getCache() { return cache; }
        public Api getApi() { return api; }

        public static class Cache {
            private String refreshRateMs;

            public String getRefreshRateMs() { return refreshRateMs; }
            public void setRefreshRateMs(String refreshRateMs) { this.refreshRateMs = refreshRateMs; }
        }

        public static class Api {
            private String timeoutMs;

            public String getTimeoutMs() { return timeoutMs; }
            public void setTimeoutMs(String timeoutMs) { this.timeoutMs = timeoutMs; }
        }
    }
}
