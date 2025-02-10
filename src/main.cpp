#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <WiFi.h>

#define livingRoom 16
#define bedRoom 17
#define terrace 18
#define carPort 19

const char *ssid = "Kodedroid";
const char *password = "aryamandaka";

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

const int NUM_LIGHTS = 4;
const int lightPins[NUM_LIGHTS] = {livingRoom, bedRoom, terrace, carPort};

void setup() {
  Serial.begin(115200);

  if (!SPIFFS.begin(true)) {
    Serial.println("failed to mount spiffs");
    return;
  }

  for (int i = 0; i < NUM_LIGHTS; i++) {
    pinMode(lightPins[i], OUTPUT);
    digitalWrite(lightPins[i], LOW);
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("connecting to wifi...");
  }
  Serial.printf("access the dashboard with the address of %s\n",
                WiFi.localIP().toString().c_str());

  ws.onEvent([](AsyncWebSocket *server, AsyncWebSocketClient *client,
                AwsEventType type, void *arg, uint8_t *data, size_t len) {
    if (type == WS_EVT_CONNECT) {
      ws.textAll("new client connected");
      Serial.println("ws connect");
      client->setCloseClientOnQueueFull(false);
      client->ping();

    } else if (type == WS_EVT_DISCONNECT) {
      ws.textAll("client disconnected");
      Serial.println("ws disconnect");

    } else if (type == WS_EVT_ERROR) {
      Serial.println("ws error");

    } else if (type == WS_EVT_DATA) {
      String message = String((char *)data).substring(0, len);
      int lightId = message.substring(0, 1).toInt();
      int state = message.substring(1).toInt();

      if (lightId >= 0 && lightId < NUM_LIGHTS) {
        digitalWrite(lightPins[lightId], state);
      }
    }
  });

  server.addHandler(&ws);
  server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html");
  server.begin();
}

void loop() { ws.cleanupClients(); }