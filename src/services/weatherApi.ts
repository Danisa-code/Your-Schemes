import axios, { AxiosRequestConfig } from "axios";

const BASE_URL = "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

/**
 * Executes an Axios request with a retry policy (up to 3 retries on network failures).
 */
async function requestWithRetry<T>(config: AxiosRequestConfig, retries = 3, delayMs = 1500): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
      const isLastAttempt = attempt === retries;

      // Fail fast on bad requests or validations (400, 404)
      if (error.response && (error.response.status === 400 || error.response.status === 404)) {
        throw new Error(error.response.data?.message || `API error: ${error.response.status}`);
      }

      if (isLastAttempt) {
        console.error("[Weather API Error] Request failed: ", error);
        throw new Error(error.response?.data?.message || "Failed to retrieve weather reports from server.");
      }

      console.warn(`Weather request failed (attempt ${attempt}/${retries}). Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Request failed");
}

export interface ForecastDay {
  day: string;
  temp: string;
  humidity: string;
  condition: string;
  icon: string;
  rainChance: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLikeTemperature: number;
  relativeHumidity: number;
  weatherCode: number;
  cloudCover: number;
  rain: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  isDay: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  rain: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
  relativeHumidity: number;
  feelsLikeTemperature: number;
}

export interface DailyForecast {
  date: string;
  maxTemperature: number;
  minTemperature: number;
  apparentMaxTemperature: number;
  apparentMinTemperature: number;
  totalRain: number;
  maxRainProbability: number;
  weatherCode: number;
  maxWindSpeed: number;
  maxUvIndex: number;
  sunrise: string;
  sunset: string;
  daylightDuration: number;
  sunshineDuration: number;
}

export interface WeatherResponse {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  forecast: ForecastDay[];
  current?: CurrentWeather;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
}

export const weatherApi = {
  getWeather: (latitude: number, longitude: number): Promise<WeatherResponse> =>
    requestWithRetry<WeatherResponse>({
      url: `/weather?latitude=${latitude}&longitude=${longitude}`,
      method: "GET",
    }),
};

