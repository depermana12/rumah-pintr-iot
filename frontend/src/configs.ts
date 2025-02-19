const configs = {
  rooms: {
    livingroom: {
      lightId: 0,
      hasBrightnessSlider: true,
      defaultBrightness: 80,
    },
    bathroom: { lightId: 1, hasBrightnessSlider: false },
    bedroom1: { lightId: 2, hasBrightnessSlider: true, defaultBrightness: 80 },
    bedroom2: { lightId: 3, hasBrightnessSlider: false },
    terrace: { lightId: 4, hasBrightnessSlider: false },
    carport: { lightId: 5, hasBrightnessSlider: false },
  },
  url: `ws://${window.location.hostname}/ws`,
};

export default configs;
