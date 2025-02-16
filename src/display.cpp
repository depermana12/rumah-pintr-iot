#include "display.h"

Display::Display() : oled(0x3c, SDA, SCL, GEOMETRY_128_32) {};

void Display::init() {
  oled.init();
  oled.flipScreenVertically();
  oled.setFont(ArialMT_Plain_10);
  oled.setTextAlignment(TEXT_ALIGN_CENTER);
};

void Display::printMessage(const String &message) {
  oled.clear();
  oled.drawString(64, 0, "Rumah Pintr");
  oled.drawString(64, 20, message);
  oled.display();
};