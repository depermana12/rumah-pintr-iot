#include "lightController.h"

LightController::LightController() {}

void LightController::init() {
  for (int i = 0; i < NUM_LIGHTS; i++) {
    if (lightPins[i].isPwm) {
      ledcSetup(lightPins[i].pwmChannel, PWM_FREQ, PWM_RES);
      ledcAttachPin(lightPins[i].roomName, lightPins[i].pwmChannel);
      ledcWrite(lightPins[i].roomName, 0);
    } else {
      pinMode(lightPins[i].roomName, OUTPUT);
      digitalWrite(lightPins[i].roomName, LOW);
    }
  }
};

void LightController::setPwmBrightness(int roomName, int brightness) {
  for (int i = 0; i < NUM_LIGHTS; i++) {
    if (lightPins[i].roomName == roomName && lightPins[i].isPwm) {
      ledcWrite(lightPins[i].pwmChannel, brightness);
      break;
    }
  }
};

void LightController::setDigitalPin(int roomName, int lightState) {
  for (int i = 0; i < NUM_LIGHTS; i++) {
    if (lightPins[i].roomName == roomName && !lightPins[i].isPwm) {
      digitalWrite(lightPins[i].roomName, lightState > 0 ? HIGH : LOW);
      break;
    }
  }
};