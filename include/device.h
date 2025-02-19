#ifndef DEVICE_H
#define DEVICE_H

#include <WiFi.h>
#include <esp_system.h>

struct DeviceInformation {
  const char *name;
  const char *version;
  const char *board;
  const char *firmware;
  char wifi_ssid[32];
  const char *wifi_signal;
  IPAddress ipAddress;
  String macAddress;
  unsigned long uptime;
};

const char *getSignalStrength(int rssi);
void myDeviceInfo(DeviceInformation &deviceInfo);

#endif