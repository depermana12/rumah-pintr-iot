#include "config.h"
#include "device.h"
#include "display.h"
#include "lightController.h"
#include "webServer.h"
#include <Arduino.h>
#include <WiFi.h>


Display display;
LightController lc;
WebServer webServer(lc);

void setup() {
  Serial.begin(115200);

  display.init();
  display.printMessage("initializing...");

  lc.init();

  display.printMessage("connecting to wifi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("connecting to wifi...");
  }

  DeviceInformation deviceInformation;
  myDeviceInfo(deviceInformation);

  String ipAddress = WiFi.localIP().toString();

  Serial.printf("access the dashboard with the address of %s\n",
                ipAddress.c_str());

  display.printMessage("http://" + ipAddress);

  webServer.init();
}

void loop() { webServer.handleClients(); }