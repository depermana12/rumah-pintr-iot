import configs from "./configs";
import WebSocketService from "./webSocketService";
import LightStateManager from "./lightStateManager";
import LightUI from "./lightUI";
import LightCardBuilder from "./components/lightCard";

class LightController {
  private webSocketService: WebSocketService;
  private stateManager: LightStateManager;
  private lightUi: LightUI;
  private cardBuilder: LightCardBuilder;

  constructor() {
    // Initialize services
    this.webSocketService = new WebSocketService();
    this.stateManager = new LightStateManager();
    this.lightUi = new LightUI();
    this.cardBuilder = new LightCardBuilder(
      this.webSocketService,
      this.stateManager,
      this.lightUi,
    );

    this.setupUI();
  }

  private setupUI(): void {
    const lightControls = document.getElementById("light-controls");
    if (!lightControls) {
      console.log("Light controls container not found");
      return;
    }

    // Create light cards for each room
    Object.entries(configs.rooms).forEach(([roomName, config]) => {
      console.log(`creating card for room: ${roomName}`, config);
      const card = this.cardBuilder.createLightCard(roomName, config as any);
      lightControls.appendChild(card);
    });
  }
}

export default LightController;
