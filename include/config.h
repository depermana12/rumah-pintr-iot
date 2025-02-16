#pragma once

#define LIVING_ROOM 32
#define BATH_ROOM 16
#define BED_ROOM_1 33
#define BED_ROOM_2 17
#define TERRACE 18
#define CAR_PORT 19

const int NUM_LIGHTS = 6;

struct LightPinConfig {
  int roomName;
  bool isPwm;
  int pwmChannel;
};

extern LightPinConfig lightPins[NUM_LIGHTS];

extern const char *WIFI_SSID;
extern const char *WIFI_PASSWORD;

const int PWM_FREQ = 5000;
const int PWM_RES = 8;
const int PWM_CH_1 = 0;
const int PWM_CH_2 = 1;