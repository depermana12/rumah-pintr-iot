type UIElements = {
  icon: HTMLElement;
  status: HTMLElement;
  sliderContainer: HTMLElement | null;
  sliderFill: HTMLElement | null;
  slider: HTMLInputElement | null;
};

class LightUI {
  public updateRoomLight(
    roomName: string,
    isOn: boolean,
    brightnesSetPoint?: number,
  ) {
    const roomLight = document.getElementById(roomName);
    const lampIcon = document.getElementById(`lamp-${roomName}`);

    if (roomLight) {
      roomLight.classList.toggle("on", isOn);

      if (brightnesSetPoint !== undefined && isOn) {
        const setRoomBrightness = 1 - brightnesSetPoint / 100;
        roomLight.style.opacity = setRoomBrightness.toString();
      } else {
        roomLight.style.opacity = "";
      }

      lampIcon?.classList.toggle("on", isOn);
    }
  }

  public updateCardStatus(
    uiElements: UIElements,
    isOn: boolean,
    brightness: number,
  ): void {
    const { icon, status, sliderContainer, sliderFill, slider } = uiElements;

    if (isOn) {
      icon.classList.add("on");
      status.textContent = slider ? `On - ${brightness}%` : "On";
    } else {
      icon.classList.remove("on");
      status.textContent = "Off";
    }

    if (slider && sliderContainer && sliderFill) {
      if (!isOn) {
        slider.disabled = true;
        sliderContainer.classList.add("disabled");
        sliderFill.classList.add("disabled");
      } else {
        slider.disabled = false;
        sliderContainer.classList.remove("disabled");
        sliderFill.classList.remove("disabled");
        sliderFill.style.width = `${brightness}%`;
        slider.value = `${brightness}`;
      }
    }
  }
}

export default LightUI;
