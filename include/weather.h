#pragma once

#include "config.h"
#include "webServer.h"
#include <DHT.h>

class Weather {
public:
  Weather();
  void begin();
  void sendWeatherData(WebServer &webServer);

private:
  DHT dht;
};