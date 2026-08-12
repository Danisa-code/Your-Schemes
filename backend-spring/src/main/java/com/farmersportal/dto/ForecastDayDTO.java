package com.farmersportal.dto;

public class ForecastDayDTO {
    private String day;
    private String temp;
    private String humidity;
    private String condition;
    private String icon;
    private String rainChance;

    public ForecastDayDTO() {}

    public ForecastDayDTO(String day, String temp, String humidity, String condition, String icon, String rainChance) {
        this.day = day;
        this.temp = temp;
        this.humidity = humidity;
        this.condition = condition;
        this.icon = icon;
        this.rainChance = rainChance;
    }

    public static ForecastDayDTOBuilder builder() {
        return new ForecastDayDTOBuilder();
    }

    // Getters and Setters
    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }
    public String getTemp() { return temp; }
    public void setTemp(String temp) { this.temp = temp; }
    public String getHumidity() { return humidity; }
    public void setHumidity(String humidity) { this.humidity = humidity; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getRainChance() { return rainChance; }
    public void setRainChance(String rainChance) { this.rainChance = rainChance; }

    public static class ForecastDayDTOBuilder {
        private String day;
        private String temp;
        private String humidity;
        private String condition;
        private String icon;
        private String rainChance;

        ForecastDayDTOBuilder() {}

        public ForecastDayDTOBuilder day(String day) { this.day = day; return this; }
        public ForecastDayDTOBuilder temp(String temp) { this.temp = temp; return this; }
        public ForecastDayDTOBuilder humidity(String humidity) { this.humidity = humidity; return this; }
        public ForecastDayDTOBuilder condition(String condition) { this.condition = condition; return this; }
        public ForecastDayDTOBuilder icon(String icon) { this.icon = icon; return this; }
        public ForecastDayDTOBuilder rainChance(String rainChance) { this.rainChance = rainChance; return this; }

        public ForecastDayDTO build() {
            return new ForecastDayDTO(day, temp, humidity, condition, icon, rainChance);
        }
    }
}
