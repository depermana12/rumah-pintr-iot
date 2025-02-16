import configs from "./configs";

class LightController {
  private lightStatus: Record<string, boolean> = {};
  private ws!: WebSocket;

  constructor() {
    this.setupWebSocket();
    this.setupEventListeners();
  }

  private setupWebSocket(): void {
    this.ws = new WebSocket(configs.url);
    this.ws.onopen = () => console.log("connection open, esp32 is ready");
    this.ws.onclose = () =>
      console.log("connection closed, check esp32 connection");
    this.ws.onerror = (error) => console.log("websocket error:", error);
  }

  private setupEventListeners(): void {
    const buttonControlDelegation = document.querySelector(".controls");
    if (!buttonControlDelegation) return;

    buttonControlDelegation.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.matches("button")) {
        const room = target.dataset.room;
        if (room) {
          this.toggleLight(room);
        }
      }
    });
  }

  private toggleLight(room: string): void {
    this.lightStatus[room] = !this.lightStatus[room];
    const isOn = this.lightStatus[room];
    console.log(
      `Toggling light for room: ${room}, Light is now: ${isOn ? "ON" : "OFF"}`,
    );
    this.updateRoomLight(room, isOn);

    if (this.ws.readyState === WebSocket.OPEN) {
      const lightIndex = this.getLightIndex(room);

      if (lightIndex !== -1) {
        const message = `L${lightIndex}:${isOn ? 1 : 0}`;
        this.ws.send(message);
        console.log(`sent message to WebSocket: ${message}`);
      }
    }
  }

  private getLightIndex(room: string): number {
    // Map room names to light indices
    const roomToIndex: Record<string, number> = {
      livingroom: 0,
      bathroom: 1,
      bedroom1: 2,
      bedroom2: 3,
      terrace: 4,
      carport: 5,
    };
    return roomToIndex[room.toLowerCase()] ?? -1;
  }

  private updateRoomLight(room: string, isOn: boolean): void {
    const overlay = document.getElementById(`light-${room}`);
    if (overlay?.parentElement) {
      overlay.parentElement.classList.toggle("on", isOn);
    }

    const lamp = document.getElementById(`lamp-${room}`);
    if (lamp) {
      lamp.classList.toggle("on", isOn);
    }

    const button = this.findButton(room);
    if (button) {
      button.classList.toggle("active", isOn);
    }
  }

  private findButton(room: string): HTMLButtonElement | undefined {
    return Array.from(document.querySelectorAll("button")).find((btn) =>
      btn.textContent?.toLowerCase().includes(room),
    ) as HTMLButtonElement | undefined;
  }
}

export default LightController;
