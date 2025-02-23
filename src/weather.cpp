#include "weather.h"
#include <ArduinoJson.h>

Weather::Weather() : dht(DHT_PIN, DHT_TYPE) {};

void Weather::begin() { dht.begin(); };

void Weather::sendWeatherData(WebServer &webSocket) {
  static unsigned long lastUpdate = 0;
  const int INTERVAL = 2000;

  if (millis() - lastUpdate >= INTERVAL) {
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    if (isnan(temp) || isnan(hum)) {
      Serial.println(F("failed to read dht sensor"));
      return;
    }

    JsonDocument doc;
    doc["type"] = "weather";
    doc["temperature"] = temp;
    doc["humidity"] = hum;

    String jsonMsg;
    serializeJson(doc, jsonMsg);

    Serial.println(jsonMsg);
    webSocket.sendText(jsonMsg);

    lastUpdate = millis();
  }
};