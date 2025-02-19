import configs from "./configs";

class WebSocketService {
  private ws!: WebSocket;
  private onOpenCb: Array<() => void> = [];
  private onCloseCb: Array<() => void> = [];
  private onErrorCb: Array<(error: Event) => void> = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private backOffDelay = 3000;

  constructor() {
    this.beginWebSocket();
  }

  private beginWebSocket(): void {
    this.ws = new WebSocket(configs.url);

    this.ws.onopen = () => {
      console.log("connection open, esp32 is ready");
      this.maxReconnectAttempts = 0;

      this.onOpenCb.forEach((cb) => cb());
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

  public onClose(cb: () => void): void {
    this.onCloseCb.push(cb);
  }

  public onError(cb: (error: Event) => void): void {
    this.onErrorCb.push(cb);
  }
}

export default WebSocketService;
