#pragma once

#include "config.h"
#include <Arduino.h>

class LightController {
public:
  LightController();
  void init();
  void setPwmBrightness(int roomName, int brightness);
  void setDigitalPin(int roomName, int lightState);
};