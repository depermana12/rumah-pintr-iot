# Rumah Pintr

Rumah Pintar - IoT is an ESP32-based IoT project designed to create a miniature smart home system. This project uses the ESP32 microcontroller to connect home appliances, enables remote control (e.g., turning lights on/off)

demo: https://youtube.com/shorts/e5fqOuCafQ4?feature=share

![Rumah pintr IoT](https://imgur.com/s8s5gi1h.jpg)

## Hardware Requirements

    ESP32 Development Board

    Led and resistor

    Breadboard and jumper wires

    Power supply

## Software Requirements

    VS Code with PlatformIO extension

    PlatformIO Core (for cli)

## Getting Started

### Installation

Install PlatformIO Core
If you haven't installed PlatformIO Core, run:

    pip install platformio

Clone the Repository

    git clone https://github.com/depermana12/rumah-pintar-iot.git

    cd rumah-pintar-iot

Install Dependencies

    pio lib install

### Configuration

Set Up Wi-Fi Credentials

    Update the src/main.cpp file with your wifi and password credentials:

    const char *ssid = "wifi-name";
    const char *password = "password";

### Building and Uploading

Compile the project:

    pio run

Upload Filesystem (SPIFFS)

    pio run --target uploadfs

Upload the Firmware

    pio run --target upload

Serial Monitor

To view the ip address of the dashboard, open serial monitor:

    pio device monitor -b 11520

## License

This project is licensed under the MIT License. See the LICENSE file for details.

Feel free to customize this README to better fit your project. Let me know if you need further assistance!
