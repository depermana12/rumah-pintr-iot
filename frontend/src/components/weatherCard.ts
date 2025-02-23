interface BaseMessage {
  type: string;
  [key: string]: string | number;
}

interface WeatherData extends BaseMessage {
  temperature: number;
  humidity: number;
  type: string;
}

type WeatherValue = {
  value: number;
  timestamp: Date;
};

type MinMaxReading = {
  min: WeatherValue | null;
  max: WeatherValue | null;
};

type CardParams = {
  containerId: string;
  label: string;
};

class WeatherCard {
  private container!: HTMLElement | null;
  private options!: CardParams;
  private readings: Record<"temperature" | "humidity", WeatherValue[]> = {
    temperature: [],
    humidity: [],
  };
  private minMaxReadings: Record<"temperature" | "humidity", MinMaxReading> = {
    temperature: { min: null, max: null },
    humidity: { min: null, max: null },
  };

  private static readonly GAUGE_CONFIG = {
    WIDTH: 100,
    HEIGHT: 50,
    STROKE_WIDTH: 8,
    MAX_READINGS: 100,
  };

  // cached DOM elements
  private elements: Record<string, HTMLElement | null> = {
    currentTemperature: null,
    currentHumidity: null,
    tempMinValue: null,
    tempMaxValue: null,
    humidityMinValue: null,
    humidityMaxValue: null,
    tempMinTime: null,
    tempMaxTime: null,
    humidityMinTime: null,
    humidityMaxTime: null,
  };

  constructor(options: CardParams) {
    const container = document.getElementById(options.containerId);
    if (!container) {
      console.log("reference to html id not found", options.containerId);
      return;
    }

    this.container = container;
    this.options = options;
    this.render();
  }

  public updateFromWebSocket(data: WeatherData): void {
    console.log("update new weather data:", data);
    this.addReading("temperature", data.temperature);
    this.addReading("humidity", data.humidity);
    this.updateUI();
  }

  private addReading(type: "temperature" | "humidity", value: number): void {
    const reading: WeatherValue = {
      value,
      timestamp: new Date(),
    };

    const readings = this.readings[type];
    readings.push(reading);

    // update min/max
    const minMax = this.minMaxReadings[type];
    if (!minMax.min || value < minMax.min.value) minMax.min = reading;
    if (!minMax.max || value > minMax.max.value) minMax.max = reading;

    // maintain fixed size buffer
    if (readings.length > WeatherCard.GAUGE_CONFIG.MAX_READINGS) {
      readings.shift();
    }
  }

  private formatTime(date: Date): string {
    return date.toLocaleString("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  private createElement(
    tag: string,
    className?: string,
    textContent = "",
  ): HTMLElement {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  }

  private createGauge(
    type: "temperature" | "humidity",
    value: number,
  ): SVGSVGElement {
    const svgNS = "http://www.w3.org/2000/svg";
    const { WIDTH, HEIGHT, STROKE_WIDTH } = WeatherCard.GAUGE_CONFIG;

    const gauge = document.createElementNS(svgNS, "svg");
    gauge.setAttribute("class", "gauge");
    gauge.setAttribute("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);
    gauge.setAttribute("preserveAspectRatio", "xMidYMid meet");
    gauge.style.width = "100%";
    gauge.style.height = "auto";
    gauge.style.maxWidth = "200px";

    // calculate dimensions for responsive scaling
    const centerX = WIDTH / 2;
    const radius = (WIDTH - STROKE_WIDTH) / 2;
    const startY = HEIGHT;

    // background arc
    const backgroundPath = document.createElementNS(svgNS, "path");
    const arcPath = this.describeArc(centerX, startY, radius);
    backgroundPath.setAttribute("d", arcPath);
    backgroundPath.setAttribute("stroke", "#eee");
    backgroundPath.setAttribute("stroke-width", STROKE_WIDTH.toString());
    backgroundPath.setAttribute("fill", "none");
    gauge.appendChild(backgroundPath);

    // value arc
    const valueArc = document.createElementNS(svgNS, "path");
    const percentage = Math.min(Math.max(value / 100, 0), 1); // clamp between 0-1
    valueArc.setAttribute("d", arcPath);
    valueArc.setAttribute("stroke", "var(--text-accent-primary)");
    valueArc.setAttribute("stroke-width", STROKE_WIDTH.toString());
    valueArc.setAttribute("stroke-dasharray", `${percentage * 157} 157`); // π * radius
    valueArc.setAttribute("fill", "none");
    gauge.appendChild(valueArc);

    // value text
    const valueText = document.createElementNS(svgNS, "text");
    valueText.setAttribute("x", centerX.toString());
    valueText.setAttribute("y", (HEIGHT - 10).toString());
    valueText.setAttribute("text-anchor", "middle");
    valueText.setAttribute("font-size", "14");
    valueText.setAttribute("fill", "var(--text-primary)");
    valueText.textContent = `${value.toFixed(1)}${type === "temperature" ? "°C" : "%"}`;
    gauge.appendChild(valueText);

    return gauge;
  }

  private describeArc(x: number, y: number, radius: number): string {
    return `M ${x - radius} ${y} A ${radius} ${radius} 0 0 1 ${x + radius} ${y}`;
  }

  private updateUI(): void {
    if (!this.container) return;

    requestAnimationFrame(() => {
      const gaugeContainers =
        this.container?.querySelectorAll(".gauge-container");
      gaugeContainers?.forEach((container, index) => {
        const type = index === 0 ? "temperature" : "humidity";
        const latestReading = this.readings[type].at(-1);

        // only update if there's new data
        if (latestReading) {
          container.innerHTML = "";
          container.appendChild(this.createGauge(type, latestReading.value));
        }
      });

      this.updateMinMaxUI("temperature");
      this.updateMinMaxUI("humidity");
    });
  }

  private updateMinMaxUI(type: "temperature" | "humidity"): void {
    const minMax = this.minMaxReadings[type];
    const unit = type === "temperature" ? "°C" : "%";

    const minValue = this.elements[`${type}MinValue`];
    const maxValue = this.elements[`${type}MaxValue`];
    const timeElement = this.elements[`${type}Time`];

    if (minMax.min && minValue && timeElement) {
      minValue.textContent = `${minMax.min.value.toFixed(1)}${unit}`;
    }

    if (minMax.max && maxValue) {
      maxValue.textContent = `${minMax.max.value.toFixed(1)}${unit}`;
    }

    if (minMax.min && timeElement) {
      timeElement.textContent = this.formatTime(minMax.min.timestamp);
    }
  }

  private createMetricSection(type: "temperature" | "humidity"): HTMLElement {
    const section = this.createElement("div", "metric");

    const header = this.createElement("div", "metric-header");
    const title = this.createElement("h2", "title");
    title.textContent = type === "temperature" ? "Temperature" : "Humidity";
    header.appendChild(title);
    section.appendChild(header);

    const gaugeContainer = this.createElement("div", "gauge-container");
    section.appendChild(gaugeContainer);

    const stats = this.createElement("div", "stats");
    const statsHeader = this.createElement("div", "stats-row stats-header");
    ["Min", "Max", "Time"].forEach((label) => {
      const headerCell = this.createElement("div", "stats-cell");
      headerCell.textContent = label;
      statsHeader.appendChild(headerCell);
    });
    stats.appendChild(statsHeader);

    const statsValues = this.createElement("div", "stats-row stats-values");
    const minValueCell = this.createElement("div", "stats-cell");
    const minValue = this.createElement("div", "stat-value");
    minValueCell.appendChild(minValue);
    this.elements[`${type}MinValue`] = minValue;

    const maxValueCell = this.createElement("div", "stats-cell");
    const maxValue = this.createElement("div", "stat-value");
    maxValueCell.appendChild(maxValue);
    this.elements[`${type}MaxValue`] = maxValue;

    const timeCell = this.createElement("div", "stats-cell");
    const timeValue = this.createElement("div", "timestamp");
    timeCell.appendChild(timeValue);
    this.elements[`${type}Time`] = timeValue;

    statsValues.append(minValueCell, maxValueCell, timeCell);
    stats.appendChild(statsValues);

    section.appendChild(stats);
    return section;
  }

  public render(): void {
    if (!this.container) return;
    this.container.innerHTML = "";

    const card = this.createElement("div", "card");
    const header = this.createElement("div", "card-header");
    const title = this.createElement("div", "title", this.options.label);
    header.appendChild(title);
    card.appendChild(header);

    const metricsGrid = this.createElement("div", "metrics-grid");
    metricsGrid.appendChild(this.createMetricSection("temperature"));
    metricsGrid.appendChild(this.createMetricSection("humidity"));
    card.appendChild(metricsGrid);

    this.container.appendChild(card);
  }
}

export default WeatherCard;
