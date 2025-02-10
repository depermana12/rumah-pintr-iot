#include <Arduino.h>
#include <unity.h>

#define livingRoom 16
#define bedRoom 17
#define terrace 18
#define carPort 19

const int NUM_LIGHTS = 4;
const int lightPins[NUM_LIGHTS] = {livingRoom, bedRoom, terrace, carPort};

void reset_pin_states() {
  for (int i = 0; i < NUM_LIGHTS; i++) {
    pinMode(lightPins[i], OUTPUT);
    digitalWrite(lightPins[i], LOW);
  }
}

void pin_low_on_initialization() {
  reset_pin_states();

  for (int i = 0; i < NUM_LIGHTS; i++) {
    TEST_ASSERT_EQUAL(LOW, digitalRead(lightPins[i]));
  }
}

void pin_switch_high_to_low() {
  reset_pin_states();

  for (int i = 0; i < NUM_LIGHTS; i++) {
    digitalWrite(lightPins[i], HIGH);
    TEST_ASSERT_EQUAL(HIGH, digitalRead(lightPins[i]));

    digitalWrite(lightPins[i], LOW);
    TEST_ASSERT_EQUAL(LOW, digitalRead(lightPins[i]));
  }
}

void setup() {
  delay(2000);
  Serial.begin(115200);

  UNITY_BEGIN();
  RUN_TEST(pin_low_on_initialization);
  RUN_TEST(pin_switch_high_to_low);
  UNITY_END();
}

void loop() {}