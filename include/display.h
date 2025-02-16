#pragma once

#include <SSD1306Wire.h>
#include <Wire.h>

class Display {
public:
  Display();
  void init();
  void printMessage(const String &message);

private:
  SSD1306Wire oled;
};