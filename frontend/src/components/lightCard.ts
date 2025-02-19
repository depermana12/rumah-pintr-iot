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
    const icon = this.createElement("button", "light-icon", "💡");

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
  ): HTMLElement {
    const element = document.createElement(tag);
    element.className = className;
    if (textContent) element.textContent = textContent;
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
