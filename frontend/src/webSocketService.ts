import configs from "./configs";
import WeatherCard from "./components/weatherCard";

interface BaseMessage {
  type: string;
  [key: string]: string | number;
}

interface WeatherData extends BaseMessage {
  temperature: number;
  humidity: number;
  type: string;
}

class WebSocketService {
  private ws!: WebSocket;
  private onOpenCb: Array<() => void> = [];
  private onCloseCb: Array<() => void> = [];
  private onErrorCb: Array<(error: Event) => void> = [];
  private onDataCb: Array<(data: WeatherData) => void> = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private backOffDelay = 3000;
  private weatherCard: WeatherCard;

  constructor() {
    this.weatherCard = new WeatherCard({
      containerId: "weather-card",
      label: "Weather Station",
    });
    this.beginWebSocket();
  }

  private beginWebSocket(): void {
    this.ws = new WebSocket(configs.url);

    this.ws.onopen = () => {
      console.log("connection open, esp32 is ready");
      this.reconnectAttempts = 0;

      this.onOpenCb.forEach((cb) => cb());
    };

    this.ws.onmessage = (event) => {
      try {
        const data: BaseMessage = JSON.parse(event.data);
        console.log("received message: ", data.type);

        switch (data.type) {
          case "weather":
            const weatherData = data as WeatherData;
            this.updateWeatherData(weatherData);
            this.onDataCb.forEach((cb) => cb(weatherData));
            break;
          default:
            console.log("unknown message");
        }
      } catch (error) {
        console.error("error parsing message data:", error);
      }
    };

    this.ws.onclose = (event) => {
      console.log("disconnected, check esp32 connection");
      this.onCloseCb.forEach((cb) => cb());

      if (event.code !== 1000) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.log("websocket error", error);
      this.onErrorCb.forEach((cb) => cb(error));
    };
  }

  private updateWeatherData(data: WeatherData): void {
    this.weatherCard.updateFromWebSocket(data);
    console.log(data.temperature);

    const dhtValue = (id: string, value: number, unit: string) => {
      const el = document.getElementById(id);
      if (!el) return;

      (el.querySelector("tspan") ?? el).textContent =
        `${value}${unit.toLowerCase()}`;
    };
    dhtValue("temperature-value", data.temperature, "°C");
    dhtValue("humidity-value", data.humidity, "%");
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      const delay = this.backOffDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(
        `attempting to reconnect (${this.reconnectAttempts} of ${this.maxReconnectAttempts}) in ${delay}ms...`,
      );
      setTimeout(() => {
        console.log(
          `reconnecting now... (attempt ${this.reconnectAttempts}of ${this.maxReconnectAttempts})`,
        );
        this.beginWebSocket();
      }, delay);
    } else {
      console.log(
        `failed to reconnect after ${this.maxReconnectAttempts} attempts.`,
      );
    }
  }

  public sendCommand(lightId: number, lightValue: number) {
    if (this.ws.readyState === WebSocket.OPEN) {
      const message = `L${lightId}:${lightValue}`;
      console.log("sending command: ", message);
      this.ws.send(message);
    } else {
      console.log("websocket not ready, current state: ", this.ws.readyState);
    }
  }

  public onOpen(cb: () => void): void {
    this.onOpenCb.push(cb);
    if (this.ws.readyState === WebSocket.OPEN) {
      cb();
    }
  }

  public onData(cb: (data: WeatherData) => void): void {
    this.onDataCb.push(cb);
  }

  public onClose(cb: () => void): void {
    this.onCloseCb.push(cb);
  }

  public onError(cb: (error: Event) => void): void {
    this.onErrorCb.push(cb);
  }
}

export default WebSocketService;
