#include "config.h"

const char *WIFI_SSID = "Kodedroid";
const char *WIFI_PASSWORD = "aryamandaka";

LightPinConfig lightPins[NUM_LIGHTS] = {
    {LIVING_ROOM, true, PWM_CH_1}, {BATH_ROOM, false, -1},
    {BED_ROOM_1, true, PWM_CH_2},  {BED_ROOM_2, false, -1},
    {TERRACE, false, -1},          {CAR_PORT, false, -1},
};