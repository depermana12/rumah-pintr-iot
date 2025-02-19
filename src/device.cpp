#include "device.h"

const char *getSignalStrength(int rssi) {
  if (rssi >= -50)
    return "Excellent";
  if (rssi >= -60)
    return "Very Good";
  if (rssi >= -70)
    return "Good";
  if (rssi >= -80)
    return "Fair";
  return "Weak";
};

void myDeviceInfo(DeviceInformation &deviceInfo) {
  deviceInfo.name = "rumah pintr";
  deviceInfo.version = "1.0.0";
  deviceInfo.board = "esp32 doit devkit v1";
  deviceInfo.firmware = "1.0.0";
  strncpy(deviceInfo.wifi_ssid, WiFi.SSID().c_str(),
          sizeof(deviceInfo.wifi_ssid));
  deviceInfo.wifi_signal = getSignalStrength(WiFi.RSSI());
  deviceInfo.ipAddress = WiFi.localIP();
  deviceInfo.macAddress = WiFi.macAddress();
  deviceInfo.uptime = millis() / 1000;
};