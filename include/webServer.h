#pragma once

#include "lightController.h"
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>

class WebServer {
public:
  WebServer(LightController &lightcontroller);
  void init();
  void handleClients();

private:
  AsyncWebServer server;
  AsyncWebSocket ws;
  LightController &lightController;
  void setupWebSocket();
};