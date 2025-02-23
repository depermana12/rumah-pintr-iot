#include "webServer.h"
#include "config.h"

WebServer::WebServer(LightController &lc)
    : server(80), ws("/ws"), lightController(lc) {}

void WebServer::init() {
  if (!SPIFFS.begin(true)) {
    Serial.println("spiffs mount error");
    return;
  }
  setupWebSocket();

  server.addHandler(&ws);
  server.on("/home", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/index.html", "text/html");
  });
  server.serveStatic("/", SPIFFS, "/");
  // .setDefaultFile("index.html");
  server.begin();
};

void WebServer::setupWebSocket() {
  ws.onEvent([this](AsyncWebSocket *server, AsyncWebSocketClient *client,
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
      Serial.println("message received from ws:" + message);

      int splitSeperator = message.indexOf(":");
      if (splitSeperator == -1) {
        Serial.println("invalid message format");
        return;
      }

      int lightRoomIndex = message.substring(1, splitSeperator).toInt();
      int lightState = message.substring(splitSeperator + 1).toInt();

      if (lightRoomIndex < 0 || lightRoomIndex > NUM_LIGHTS) {
        Serial.println("invalid lightid: " + String(lightRoomIndex));
      }

      LightPinConfig pinConfig = lightPins[lightRoomIndex];

      if (pinConfig.isPwm) {
        lightController.setPwmBrightness(pinConfig.roomName, lightState);
        Serial.println("set brightness for room: " + String(lightRoomIndex) +
                       "to" + String(lightState));
      } else {
        lightController.setDigitalPin(pinConfig.roomName, lightState);
        Serial.println("toggle light for room: " + String(lightRoomIndex) +
                       " to " + (lightState > 0 ? "HIGH" : "LOW"));
      }
    };
  });
};

void WebServer::handleClients() { ws.cleanupClients(); };

void WebServer::sendText(const String &jsonMsg) { ws.textAll(jsonMsg.c_str()); }