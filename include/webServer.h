#pragma once

#include "lightController.h"
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>

class WebServer {
public:
  WebServer(LightController &lightcontroller);
  void init();
  void handleClients();
  void sendText(const String &jsonMsg);

private:
  AsyncWebServer server;
  AsyncWebSocket ws;
  LightController &lightController;
  void setupWebSocket();
};