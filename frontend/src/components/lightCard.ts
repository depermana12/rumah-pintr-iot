import WebSocketService from "../webSocketService";
import LightUI from "../lightUI";
import LightStateManager, { RoomLightConfig } from "../lightStateManager";

type UIElements = {
  icon: HTMLElement;
  status: HTMLElement;
  sliderContainer: HTMLElement | null;
  sliderFill: HTMLElement | null;
  slider: HTMLInputElement | null;
};

type EventParams = {
  roomName: string;
  config: RoomLightConfig;
  elements: UIElements;
};

class LightCardBuilder {
  private webSocketService: WebSocketService;
  private stateManager: LightStateManager;
  private lightUi: LightUI;

  constructor(
    webSocketService: WebSocketService,
    stateManager: LightStateManager,
    lightUi: LightUI,
  ) {
    this.webSocketService = webSocketService;
    this.stateManager = stateManager;
    this.lightUi = lightUi;
  }

  public createLightCard(
    roomName: string,
    config: RoomLightConfig,
  ): HTMLElement {
    const fragment = document.createDocumentFragment();

    const card = this.createElement("div", "light-card");
    const header = this.createElement("div", "light-header");

    const svgIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    svgIcon.setAttribute("viewBox", "0 -960 960 960");
    svgIcon.setAttribute("class", "switch-lamp");
    svgIcon.setAttribute("width", "24");
    svgIcon.setAttribute("height", "24");
    svgIcon.innerHTML = `<path d="M479.99-65.41q-34.19 0-58.52-25.06-24.34-25.05-24.34-60.68h165.74q0 35.63-24.35 60.68-24.34 25.06-58.53 25.06ZM317.85-193.07v-83.58h324.3v83.58h-324.3Zm10-125.5Q256.7-361 214.28-432.03q-42.41-71.04-42.41-154.67 0-128.28 89.86-218.09 89.87-89.8 218.24-89.8 128.38 0 218.27 89.8 89.89 89.81 89.89 218.09 0 83.87-42.41 154.79Q703.3-361 632.15-318.57h-304.3Zm27.35-91h249.6q44.29-31.52 68.31-77.56 24.02-46.04 24.02-99.51 0-91.1-63.04-154.02-63.05-62.93-154.09-62.93t-154.09 62.93q-63.04 62.92-63.04 154.02 0 53.47 24.02 99.51 24.02 46.04 68.31 77.56Zm124.8 0Z"/>`;

    const icon = this.createElement("button", "light-icon", "", svgIcon);

    const labelWrapper = this.createElement("div", "label-wrapper");
    const title = this.createElement(
      "h3",
      "light-title",
      roomName.charAt(0).toUpperCase() + roomName.slice(1),
    );
    const status = this.createElement("div", "light-status", "Off");

    labelWrapper.append(title, status);
    header.append(icon, labelWrapper);
    card.appendChild(header);

    let sliderContainer = null;
    let sliderFill = null;
    let slider = null;

    if (config.hasBrightnessSlider) {
      sliderContainer = this.createElement("div", "slider-container disabled");
      sliderFill = this.createElement("div", "slider-fill disabled");
      sliderFill.style.width = `${config.defaultBrightness || 0}%`;

      slider = this.createElement("input", "slider") as HTMLInputElement;
      slider.type = "range";
      slider.min = "0";
      slider.max = "100";
      slider.value = `${config.defaultBrightness || 0}`;
      slider.disabled = true;

      sliderContainer.append(sliderFill, slider);
      card.appendChild(sliderContainer);
    }

    fragment.appendChild(card);

    const elements: UIElements = {
      icon,
      status,
      sliderContainer,
      sliderFill,
      slider,
    };

    this.attachIconEventListener({ roomName, config, elements });
    if (slider) this.attachSliderEventListener({ roomName, config, elements });

    return fragment.firstChild as HTMLElement;
  }

  private createElement(
    tag: string,
    className: string,
    textContent = "",
    child?: Node,
  ): HTMLElement {
    const element = document.createElement(tag);
    element.className = className;
    if (textContent) element.textContent = textContent;
    if (child) element.appendChild(child);
    return element;
  }

  private attachSliderEventListener({
    roomName,
    config,
    elements,
  }: EventParams): void {
    const { slider, sliderFill, status, icon } = elements;

    let debounceTimer: ReturnType<typeof setTimeout>;

    slider?.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);

      const value = parseInt((e.target as HTMLInputElement).value);

      if (sliderFill) {
        sliderFill.style.width = `${value}%`;
        status.textContent = value > 0 ? `On - ${value}%` : "Off";

        //100ms debounce
        debounceTimer = setTimeout(() => {
          const isOn = value > 0;
          icon.classList.toggle("on", isOn);

          // update sate
          this.stateManager.setState(roomName, {
            isOn,
            brightnessValue: value,
          });

          // update ui
          this.lightUi.updateRoomLight(roomName, isOn, value);

          // send ws command
          const pwmValue = Math.round((value / 100) * 255);
          this.webSocketService.sendCommand(config.lightId, pwmValue);
        }, 100);
      }
    });
  }

  private attachIconEventListener({
    roomName,
    config,
    elements,
  }: EventParams): void {
    elements.icon.addEventListener("click", () => {
      const state = this.stateManager.getState(roomName);
      const newIsOn = !state.isOn;

      let brightness = 0;

      if (config.hasBrightnessSlider && elements.slider) {
        if (newIsOn) {
          // if turning on and brightness is 0, use default or 50%
          const currentValue = parseInt(elements.slider.value);
          brightness =
            currentValue === 0 ? config.defaultBrightness || 50 : currentValue;
          elements.slider.value = String(brightness);
          if (elements.sliderFill) {
            elements.sliderFill.style.width = `${brightness}%`;
          }
        } else {
          // When  off, preserve the current brightness value
          brightness = parseInt(elements.slider.value);
        }
      } else {
        brightness = newIsOn ? 100 : 0;
      }

      this.updateStateAndUI(roomName, elements, newIsOn, brightness);

      let pwmValue;
      if (newIsOn) {
        pwmValue = Math.round((brightness / 100) * 255);
      } else {
        pwmValue = 0;
      }
      const svgIcon = elements.icon.querySelector("svg");
      if (svgIcon) {
        svgIcon.classList.toggle("on", newIsOn);
      }
      this.webSocketService.sendCommand(config.lightId, pwmValue);
    });
  }

  private updateStateAndUI(
    roomName: string,
    elements: UIElements,
    isOn: boolean,
    brightness?: number,
  ): void {
    this.stateManager.setState(roomName, { isOn, brightnessValue: brightness });

    requestAnimationFrame(() => {
      this.lightUi.updateCardStatus(elements, isOn, brightness ?? 100);
      const brightnessParam = elements.slider ? brightness : undefined;
      this.lightUi.updateRoomLight(roomName, isOn, brightnessParam);
    });
  }
}

export default LightCardBuilder;
