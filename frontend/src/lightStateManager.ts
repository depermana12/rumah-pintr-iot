import configs from "./configs";

export type RoomLightConfig = {
  lightId: number;
  hasBrightnessSlider: boolean;
  defaultBrightness?: number;
};

export type LightState = {
  isOn: boolean;
  brightnessValue: number;
};

export type AppConfig = {
  rooms: Record<string, RoomLightConfig>;
  url: string;
};

class LightStateManager {
  private states: Record<string, LightState> = {};
  // { "livingroom": { "isOn": false, "brightnessValue": 80}}
  constructor() {
    this.setupRoomConfig(configs);
  }

  private setupRoomConfig(configs: AppConfig) {
    Object.entries(configs.rooms).forEach(([roomName, config]) => {
      const roomConfig = config as RoomLightConfig;
      this.states[roomName] = {
        isOn: false,
        brightnessValue: roomConfig.defaultBrightness || 0,
      };
    });
  }

  public getState(roomName: string): LightState {
    return this.states[roomName];
  }

  public setState(roomName: string, newState: Partial<LightState>): void {
    this.states[roomName] = {
      ...this.states[roomName],
      ...newState,
    };
  }

  public getAllStates(): Record<string, LightState> {
    return this.states;
  }
}

export default LightStateManager;
